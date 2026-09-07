import express from 'express';
import {
  getProviderDashboardStats,
  getProviderEarnings,
  getProviderAvailability,
  updateProviderAvailability,
  updateProviderProfile
} from '../controllers/providerStatsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticate, getProviderDashboardStats);
router.get('/earnings', authenticate, getProviderEarnings);
router.get('/availability', authenticate, getProviderAvailability);
router.put('/availability', authenticate, updateProviderAvailability);
router.put('/profile', authenticate, updateProviderProfile);

export default router;
