import express from 'express';
import {
  getAdminDashboardStats,
  getAdminProviders,
  updateProviderStatus,
  getAdminCustomers,
  getAdminBookings,
  getAdminMatchingInspection,
  getAdminCancellationAndLeakage,
  getAdminAIInsights,
  getAdminNotifications,
  markAdminNotificationsRead,
  getAdminSettings
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/providers', getAdminProviders);
router.patch('/providers/:id', updateProviderStatus);
router.get('/customers', getAdminCustomers);
router.get('/bookings', getAdminBookings);
router.get('/matching', getAdminMatchingInspection);
router.get('/leakage-risk', getAdminCancellationAndLeakage);
router.get('/ai-insights', getAdminAIInsights);
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/read-all', markAdminNotificationsRead);
router.get('/settings', getAdminSettings);

export default router;
