import mongoose from 'mongoose';
import Provider from '../models/Provider.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import { matchProviders, isProviderEligible } from '../services/matchingEngine.js';
import { geocodePlace, haversineDistanceMeters } from '../utils/geolocation.js';

export const enrichProviderDynamicRating = async (provider) => {
  if (!provider) return provider;
  const providerIdentities = [];
  if (provider.id) providerIdentities.push(provider.id);
  if (provider._id) providerIdentities.push(provider._id.toString());
  if (provider.userId) providerIdentities.push(provider.userId);
  if (provider.workerId) providerIdentities.push(provider.workerId);

  // Find all verified, authentic customer reviews for this provider in MongoDB
  const reviews = await Review.find({
    providerId: { $in: providerIdentities },
    isSuspicious: false
  }).lean();

  const validReviews = (reviews || []).filter(r => typeof r.rating === 'number' && r.rating > 0);

  if (validReviews.length > 0) {
    const avg = validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length;
    provider.rating = parseFloat(avg.toFixed(2));
    provider.reviewsCount = validReviews.length;
  } else {
    provider.rating = 0;
    provider.reviewsCount = 0;
  }
  return provider;
};

export const getProviders = async (req, res) => {
  try {
    const { category, search, minRating, maxPrice, availableToday, sortBy, latitude, longitude, location } = req.query;

    const filter = {};
    filter.status = 'Active';
    filter.isAvailable = true;
    filter.availabilityStatus = { $ne: 'Off Duty' };

    if (category && category !== 'all') {
      filter.categories = category;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { skill: regex },
        { location: regex },
        { serviceAreas: regex }
      ];
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      filter.startingPrice = { $lte: parseFloat(maxPrice) };
    }

    if (availableToday === 'true' || availableToday === true) {
      filter.availabilityStatus = 'Available Today';
    }

    // If sortBy is 'relevance' and category or search is provided, use smart matching engine!
    if (sortBy === 'relevance' && (category || search)) {
      const allProviders = await Provider.find(filter).lean();
      const matchResult = matchProviders(allProviders, {
        categoryId: category,
        serviceTitle: search,
        minRating,
        maxPrice
      });
      return res.status(200).json({
        success: true,
        providers: matchResult.rankedProviders,
        topMatch: matchResult.topMatch,
        total: matchResult.rankedProviders.length,
        isSmartMatched: true
      });
    }

    let query = Provider.find(filter);

    if (sortBy) {
      switch (sortBy) {
        case 'rating':
          query = query.sort({ rating: -1 });
          break;
        case 'distance':
          query = query.sort({ distanceKm: 1 });
          break;
        case 'price_low':
          query = query.sort({ startingPrice: 1 });
          break;
        case 'trust':
          query = query.sort({ trustScore: -1 });
          break;
        default:
          break;
      }
    }

    let providers = await query.lean().exec();

    if (location) {
      providers = providers.filter((provider) => isProviderEligible(provider, location));
    }

    // Dynamically calculate average rating from actual reviews (Requirement 6)
    providers = await Promise.all(providers.map(async (p) => {
      const coordinates = Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))
        ? null
        : await geocodePlace(p.location);
      if (coordinates) {
        p.latitude = coordinates.latitude;
        p.longitude = coordinates.longitude;
      }
      if (Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) && Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))) {
        p.distanceKm = haversineDistanceMeters(Number(latitude), Number(longitude), Number(p.latitude), Number(p.longitude)) / 1000;
      }
      return enrichProviderDynamicRating(p);
    }));

    if (sortBy === 'distance') {
      providers.sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
    }

    if (!sortBy || sortBy === 'relevance' || sortBy === 'ai') {
      providers = [...providers].sort(
        (a, b) =>
          ((b.trustScore || 0) * 0.4 + (b.rating || 0) * 10 * 0.6) -
          ((a.trustScore || 0) * 0.4 + (a.rating || 0) * 10 * 0.6)
      );
    }

    return res.status(200).json({
      success: true,
      providers,
      total: providers.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const smartMatchProviders = async (req, res) => {
  try {
    const radiusKm = req.body?.radiusKm ?? req.query?.radiusKm ?? null;
    const criteria = {
      categoryId: req.body?.categoryId || req.body?.category || req.query?.category || req.query?.categoryId || 'all',
      serviceId: req.body?.serviceId || req.query?.serviceId,
      serviceTitle: req.body?.serviceTitle || req.body?.service || req.query?.serviceTitle,
      customerLocation: req.body?.customerLocation || req.query?.location || '',
      urgency: req.body?.urgency || req.query?.urgency || 'today',
      maxPrice: req.body?.maxPrice || req.query?.maxPrice,
      minRating: req.body?.minRating || req.query?.minRating
    };

    let allProviders = await Provider.find({ status: 'Active', isAvailable: true, availabilityStatus: { $ne: 'Off Duty' } }).lean();
    allProviders = await Promise.all(allProviders.map(async (p) => {
      const coordinates = Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))
        ? null
        : await geocodePlace(p.location);
      if (coordinates) {
        p.latitude = coordinates.latitude;
        p.longitude = coordinates.longitude;
      }
      return enrichProviderDynamicRating(p);
    }));

    if (radiusKm !== null && radiusKm !== undefined && radiusKm !== '') {
      const parsedRadius = Number(radiusKm);
      if (!Number.isNaN(parsedRadius) && parsedRadius > 0) {
        const filteredProviders = allProviders.filter((provider) => {
          const distanceKm = Number(provider.distanceKm);
          return Number.isFinite(distanceKm) && distanceKm <= parsedRadius;
        });
        allProviders = filteredProviders;
      }
    }

    const matchResult = matchProviders(allProviders, criteria);

    return res.status(200).json(matchResult);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    let provider = await Provider.findOne(query).lean();

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    // Dynamic rating calculation from actual reviews (Requirement 6)
    provider = await enrichProviderDynamicRating(provider);
    if (!Number.isFinite(Number(provider.latitude)) || !Number.isFinite(Number(provider.longitude))) {
      const coordinates = await geocodePlace(provider.location);
      if (coordinates) {
        provider.latitude = coordinates.latitude;
        provider.longitude = coordinates.longitude;
      }
    }

    return res.status(200).json({
      success: true,
      provider
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Booked Slot Removal Controller (Requirement 10)
export const getBookedSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedDate = req.query.date || new Date().toISOString().split('T')[0];

    const providerQuery = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const provider = await Provider.findOne(providerQuery);
    const providerIdentities = [id];
    if (provider) {
      if (provider.id && !providerIdentities.includes(provider.id)) providerIdentities.push(provider.id);
      if (provider._id && !providerIdentities.includes(provider._id.toString())) providerIdentities.push(provider._id.toString());
      if (provider.userId && !providerIdentities.includes(provider.userId)) providerIdentities.push(provider.userId);
    }
    if (id === 'prov_1' && !providerIdentities.includes('usr_provider_demo')) {
      providerIdentities.push('usr_provider_demo');
    }
    if (id === 'usr_provider_demo' && !providerIdentities.includes('prov_1')) {
      providerIdentities.push('prov_1');
    }

    const activeBookingStatuses = [
      'BOOKED',
      'ACCEPTED',
      'PROVIDER_ACCEPTED',
      'ON_THE_WAY',
      'ARRIVED',
      'IN_PROGRESS'
    ];

    const activeBookings = await Booking.find({
      providerId: { $in: providerIdentities },
      date: requestedDate,
      status: { $in: activeBookingStatuses }
    }).select('time').lean();

    const bookedSlots = activeBookings.map(b => b.time).filter(Boolean);

    return res.status(200).json({
      success: true,
      date: requestedDate,
      providerId: id,
      bookedSlots
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProviderReviews = async (req, res) => {
  try {
    const { id } = req.params;
    let provider = null;

    if (id === 'me' && req.user?.id) {
      const uId = req.user.id;
      const userQuery = mongoose.isValidObjectId(uId)
        ? { $or: [{ _id: uId }, { id: uId }, { userId: uId }, { workerId: uId }] }
        : { $or: [{ id: uId }, { userId: uId }, { workerId: uId }] };
      provider = await Provider.findOne(userQuery);
      if (!provider && req.user.email) {
        provider = await Provider.findOne({ email: req.user.email.toLowerCase() });
      }
    } else {
      const query = mongoose.isValidObjectId(id)
        ? { $or: [{ _id: id }, { id }, { userId: id }, { workerId: id }] }
        : { $or: [{ id }, { userId: id }, { workerId: id }] };
      provider = await Provider.findOne(query);
    }

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const providerIdentities = [id];
    if (provider.id && !providerIdentities.includes(provider.id)) providerIdentities.push(provider.id);
    if (provider._id && !providerIdentities.includes(provider._id.toString())) providerIdentities.push(provider._id.toString());
    if (provider.userId && !providerIdentities.includes(provider.userId)) providerIdentities.push(provider.userId);
    if (provider.workerId && !providerIdentities.includes(provider.workerId)) providerIdentities.push(provider.workerId);

    const reviews = await Review.find({
      providerId: { $in: providerIdentities.filter(Boolean) },
      isSuspicious: false
    }).sort({ createdAt: -1 }).lean();

    const validReviews = reviews || [];
    const count = validReviews.length;
    const averageRating = count > 0
      ? parseFloat((validReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2))
      : 0;

    const fiveStarCount = validReviews.filter(r => r.rating === 5).length;
    const fiveStarRate = count > 0 ? parseFloat(((fiveStarCount / count) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      reviews: validReviews,
      rating: averageRating,
      reviewsCount: count,
      fiveStarRate,
      fiveStarCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addProviderReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, rating, comment, serviceTag, bookingId } = req.body;

    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const provider = await Provider.findOne(query);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const newReview = await Review.create({
      providerId: provider.id || id,
      customerId: req.user?.id || 'usr_customer_demo',
      customerName: customerName || req.user?.name || 'Verified Customer',
      bookingId: bookingId || '',
      rating: Number(rating) || 5,
      comment: comment || 'Great service!',
      serviceTag: serviceTag || provider.skill || 'General Service',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });

    // Update provider embedded reviews and recalculated rating if in MongoDB
    if (provider.save) {
      if (!provider.reviews) provider.reviews = [];
      provider.reviews.unshift({
        id: newReview.id,
        customerName: newReview.customerName,
        rating: newReview.rating,
        comment: newReview.comment,
        serviceTag: newReview.serviceTag,
        date: newReview.date
      });
      provider.reviewsCount = (provider.reviewsCount || 0) + 1;
      const allRatings = provider.reviews.map(r => r.rating);
      provider.rating = Number((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2));
      await provider.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
