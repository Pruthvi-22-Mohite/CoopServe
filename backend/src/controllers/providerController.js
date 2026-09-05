import { inMemoryStore } from '../store/inMemoryStore.js';
import { matchProviders } from '../services/matchingEngine.js';

export const getProviders = async (req, res) => {
  try {
    const { category, search, minRating, maxPrice, availableToday, sortBy } = req.query;
    
    // If sortBy is 'relevance' and category or search is provided, use smart matching engine!
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

    const matchResult = matchProviders(inMemoryStore.providers, criteria);

    return res.status(200).json(matchResult);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = inMemoryStore.getProviderById(id);
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
    const provider = inMemoryStore.getProviderById(id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    return res.status(200).json({
      success: true,
      reviews: provider.reviews || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
