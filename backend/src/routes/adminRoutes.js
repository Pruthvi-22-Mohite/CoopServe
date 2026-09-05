import express from 'express';
import {
  getAdminDashboardStats,
  getAdminProviders,
  updateProviderStatus,
  getAdminCustomers,
  getAdminMatchingInspection,
  getAdminCancellationAndLeakage,
  getAdminAIInsights
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', authenticate, getAdminDashboardStats);
router.get('/providers', authenticate, getAdminProviders);
router.patch('/providers/:id', authenticate, updateProviderStatus);
router.get('/customers', authenticate, getAdminCustomers);
router.get('/matching', authenticate, getAdminMatchingInspection);
router.get('/leakage-risk', authenticate, getAdminCancellationAndLeakage);
router.get('/ai-insights', authenticate, getAdminAIInsights);

export default router;
