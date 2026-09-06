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
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce role-based route protection: Only ADMIN role is allowed to access Admin APIs
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', authenticate, authorize('ADMIN'), getAdminDashboardStats);
router.get('/providers', authenticate, authorize('ADMIN'), getAdminProviders);
router.patch('/providers/:id', authenticate, authorize('ADMIN'), updateProviderStatus);
router.get('/customers', authenticate, authorize('ADMIN'), getAdminCustomers);
router.get('/matching', authenticate, authorize('ADMIN'), getAdminMatchingInspection);
router.get('/leakage-risk', authenticate, authorize('ADMIN'), getAdminCancellationAndLeakage);
router.get('/ai-insights', authenticate, authorize('ADMIN'), getAdminAIInsights);

export default router;

