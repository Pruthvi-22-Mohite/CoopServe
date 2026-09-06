import express from 'express';
import {
  getProviders,
  getProviderById,
  getProviderReviews,
  addProviderReview,
  smartMatchProviders
} from '../controllers/providerController.js';

const router = express.Router();

router.get('/match', smartMatchProviders);
router.post('/match', smartMatchProviders);
router.get('/', getProviders);
router.get('/:id', getProviderById);
router.get('/:id/reviews', getProviderReviews);
router.post('/:id/reviews', addProviderReview);

export default router;
