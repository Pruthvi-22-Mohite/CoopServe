import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Provider from '../models/Provider.js';

// ---------------------------------------------------------------------------
// Fraud detection configuration — easy to tune for SIH demo
// ---------------------------------------------------------------------------
const BURST_THRESHOLD = 5;       // number of 5-star ratings
const BURST_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const NEGATIVE_KEYWORDS = [
  'worst', 'terrible', 'horrible', 'awful', 'disgusting', 'pathetic',
  'useless', 'fraud', 'cheat', 'scam', 'never', 'avoid', 'bad', 'poor',
  'disappointing', 'waste', 'rip-off', 'ripoff', 'fake', 'liar'
];

const POSITIVE_KEYWORDS = [
  'excellent', 'amazing', 'outstanding', 'wonderful', 'perfect', 'great',
  'superb', 'loved', 'fantastic', 'best', 'brilliant', 'exceptional',
  'awesome', 'terrific', 'incredible'
];

/**
 * Counts keyword matches in a lowercased text.
 */
const countKeywordMatches = (text, keywords) => {
  const lower = text.toLowerCase();
  return keywords.filter(kw => lower.includes(kw)).length;
};

/**
 * Detects suspicious patterns and returns { isSuspicious, suspiciousReasons }.
 */
const detectSuspiciousRating = async (customerId, rating, review) => {
  const suspiciousReasons = [];

  // --- Pattern 1: Rating burst ---
  // Only flag 5-star bursts (most common manipulation target)
  if (rating === 5) {
    const windowStart = new Date(Date.now() - BURST_WINDOW_MS);
    const recentHighRatings = await Review.countDocuments({
      customerId,
      rating: 5,
      createdAt: { $gte: windowStart }
    });

    if (recentHighRatings >= BURST_THRESHOLD) {
      suspiciousReasons.push('rating_burst');
    }
  }

  // --- Pattern 2: Sentiment / star mismatch ---
  if (review && review.trim().length > 0) {
    const negativeCount = countKeywordMatches(review, NEGATIVE_KEYWORDS);
    const positiveCount = countKeywordMatches(review, POSITIVE_KEYWORDS);

    // 5-star with strongly negative language
    if (rating === 5 && negativeCount >= 2) {
      suspiciousReasons.push('sentiment_mismatch');
    }

    // 1-star with strongly positive language
    if (rating === 1 && positiveCount >= 2) {
      suspiciousReasons.push('sentiment_mismatch');
    }
  }

  return {
    isSuspicious: suspiciousReasons.length > 0,
    suspiciousReasons
  };
};

// ---------------------------------------------------------------------------
// POST /api/ratings/bookings/:bookingId
// Auth: authenticated customer only
// Body: { rating: 1-5, review: string (optional) }
// ---------------------------------------------------------------------------
export const submitRating = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    const userRole = (req.user?.role || '').toUpperCase();

    // 1. Authentication — guaranteed by middleware, but double-check
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // 2. Only customers can rate (not providers or admins pretending to rate)
    if (userRole !== 'CUSTOMER') {
      return res.status(403).json({
        success: false,
        message: 'Only customers can submit ratings.'
      });
    }

    // 3. Validate rating value
    const ratingValue = parseInt(req.body.rating, 10);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    // 4. Validate and sanitize review
    let reviewText = (req.body.review || '').trim();
    if (reviewText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Review must be 500 characters or fewer.'
      });
    }
    // Basic sanitization: strip HTML tags
    reviewText = reviewText.replace(/<[^>]*>/g, '').trim();

    // 5. Find the booking
    const bookingQuery = mongoose.isValidObjectId(bookingId)
      ? { $or: [{ _id: bookingId }, { id: bookingId }] }
      : { id: bookingId };

    const booking = await Booking.findOne(bookingQuery);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // 6. Verify the requesting user is the booking's customer
    if (String(booking.customerId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not the customer for this booking.'
      });
    }

    // 7. Booking must be COMPLETED
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: `Cannot rate a booking that is not completed. Current status: ${booking.status}`
      });
    }

    // 8. Duplicate protection — booking can only be rated once
    if (booking.ratingStatus === 'RATED') {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a rating for this booking.'
      });
    }

    // 9. Fraud detection
    const { isSuspicious, suspiciousReasons } = await detectSuspiciousRating(
      userId,
      ratingValue,
      reviewText
    );

    if (isSuspicious) {
      console.warn(
        `[Rating] Suspicious rating detected from customer ${userId} on booking ${booking.id}:`,
        suspiciousReasons
      );
    }

    // 10. Persist the review
    const review = await Review.create({
      id: `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      providerId: booking.providerId,
      customerId: userId,
      customerName: booking.customerName || req.user?.name || 'Customer',
      bookingId: booking.id,
      rating: ratingValue,
      comment: reviewText || `${ratingValue}-star rating`,
      serviceTag: booking.serviceTitle || 'General Service',
      isSuspicious,
      suspiciousReasons
    });

    // 11. Update booking: mark as rated, store rating, clear pendingRating
    booking.ratingStatus = 'RATED';
    booking.pendingRating = false;
    booking.rating = ratingValue;
    booking.review = reviewText;
    booking.updatedAt = new Date().toISOString();
    await booking.save();

    // 12. Update provider's aggregate rating and push to work history
    try {
      const providerQuery = mongoose.isValidObjectId(booking.providerId)
        ? { $or: [{ _id: booking.providerId }, { id: booking.providerId }] }
        : { id: booking.providerId };

      const provider = await Provider.findOne(providerQuery);
      if (provider) {
        // Update aggregate rating (simple running average)
        const totalReviews = await Review.countDocuments({
          providerId: booking.providerId,
          isSuspicious: false
        });
        const ratingSum = await Review.aggregate([
          { $match: { providerId: booking.providerId, isSuspicious: false } },
          { $group: { _id: null, total: { $sum: '$rating' } } }
        ]);
        const newAvgRating = totalReviews > 0
          ? parseFloat((ratingSum[0]?.total / totalReviews).toFixed(2))
          : ratingValue;

        provider.rating = newAvgRating;
        provider.reviewsCount = (provider.reviewsCount || 0) + 1;

        // Update work history entry: find by bookingId and set actual rating
        if (provider.workHistory && provider.workHistory.length > 0) {
          const whEntry = provider.workHistory.find(w => w.id === booking.id);
          if (whEntry) {
            whEntry.rating = ratingValue;
          } else {
            provider.workHistory.unshift({
              id: booking.id,
              customer: booking.customerName,
              service: booking.serviceTitle,
              date: booking.date,
              rating: ratingValue,
              verified: true
            });
          }
        }

        await provider.save();
      }
    } catch (providerErr) {
      // Non-fatal — rating is already saved, provider stats update is best-effort
      console.warn('[Rating] Provider update error:', providerErr.message);
    }

    return res.status(201).json({
      success: true,
      message: isSuspicious
        ? 'Rating submitted and flagged for review.'
        : 'Rating submitted successfully.',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        serviceTag: review.serviceTag,
        createdAt: review.createdAt,
        isSuspicious: review.isSuspicious,
        suspiciousReasons: review.suspiciousReasons
      }
    });
  } catch (err) {
    console.error('[Rating] submitRating error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/ratings/bookings/:bookingId
// Auth: booking owner or provider or admin
// Returns the rating for a specific booking (if submitted)
// ---------------------------------------------------------------------------
export const getRatingForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const review = await Review.findOne({ bookingId });

    if (!review) {
      return res.status(200).json({
        success: true,
        rated: false,
        review: null
      });
    }

    return res.status(200).json({
      success: true,
      rated: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        serviceTag: review.serviceTag,
        customerName: review.customerName,
        createdAt: review.createdAt
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
