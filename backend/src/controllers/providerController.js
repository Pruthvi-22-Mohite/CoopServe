import mongoose from 'mongoose';
import Provider from '../models/Provider.js';
import Review from '../models/Review.js';
import { inMemoryStore } from '../store/inMemoryStore.js';
import { matchProviders } from '../services/matchingEngine.js';

export const getProviders = async (req, res) => {
  try {
    const { category, search, minRating, maxPrice, availableToday, sortBy } = req.query;

    const mongoCount = await Provider.countDocuments();

    if (mongoCount > 0) {
      const filter = {};

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
        const allProviders = await Provider.find(filter);
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

      let providers = await query.exec();

      if (!sortBy || sortBy === 'relevance' || sortBy === 'ai') {
        providers = [...providers].sort((a, b) => (b.trustScore * 0.4 + b.rating * 10 * 0.6) - (a.trustScore * 0.4 + a.rating * 10 * 0.6));
      }

      return res.status(200).json({
        success: true,
        providers,
        total: providers.length
      });
    }

    // Fallback to in-memory store when MongoDB has no providers yet
    if (sortBy === 'relevance' && (category || search)) {
      const matchResult = matchProviders(inMemoryStore.providers, {
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

    const providers = inMemoryStore.getProviders({
      category,
      search,
      minRating,
      maxPrice,
      availableToday,
      sortBy
    });

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
    const criteria = {
      categoryId: req.body?.categoryId || req.body?.category || req.query?.category || req.query?.categoryId || 'all',
      serviceId: req.body?.serviceId || req.query?.serviceId,
      serviceTitle: req.body?.serviceTitle || req.body?.service || req.query?.serviceTitle,
      customerLocation: req.body?.customerLocation || req.query?.location || 'Kothrud, Pune',
      urgency: req.body?.urgency || req.query?.urgency || 'today',
      maxPrice: req.body?.maxPrice || req.query?.maxPrice,
      minRating: req.body?.minRating || req.query?.minRating
    };

    let allProviders = await Provider.find({});
    if (!allProviders || allProviders.length === 0) {
      allProviders = inMemoryStore.providers;
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

    let provider = await Provider.findOne(query);
    if (!provider) {
      provider = inMemoryStore.getProviderById(id);
    }

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    return res.status(200).json({
      success: true,
      provider
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProviderReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    let provider = await Provider.findOne(query);
    if (!provider) {
      provider = inMemoryStore.getProviderById(id);
    }

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const providerIdVal = provider.id || (provider._id ? provider._id.toString() : id);
    let reviews = await Review.find({
      $or: [
        { providerId: providerIdVal },
        { providerId: id },
        ...(provider._id ? [{ providerId: provider._id.toString() }] : [])
      ]
    }).sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0) {
      reviews = provider.reviews || [];
    }

    return res.status(200).json({
      success: true,
      reviews
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

    let provider = await Provider.findOne(query);
    if (!provider) {
      provider = inMemoryStore.getProviderById(id);
    }

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
