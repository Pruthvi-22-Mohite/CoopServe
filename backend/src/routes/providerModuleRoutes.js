import express from 'express';
import {
  getProviderDashboardStats,
  getProviderEarnings,
  getProviderAvailability,
  updateProviderAvailability
} from '../controllers/providerStatsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticate, getProviderDashboardStats);
router.get('/earnings', authenticate, getProviderEarnings);
router.get('/availability', authenticate, getProviderAvailability);
router.put('/availability', authenticate, updateProviderAvailability);

export default router;
