import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  verifyBookingLocation,
  emergencyReassignBooking
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getBookings);
router.post('/', authenticate, createBooking);
router.post('/:id/emergency-reassign', authenticate, emergencyReassignBooking);
router.get('/:id', authenticate, getBookingById);
router.post('/:id/verify-location', authenticate, verifyBookingLocation);
router.patch('/:id/status', authenticate, updateBookingStatus);
router.put('/:id/status', authenticate, updateBookingStatus);
router.post('/:id/cancel', authenticate, cancelBooking);

export default router;
