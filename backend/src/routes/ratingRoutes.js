import express from 'express';
import { submitRating, getRatingForBooking } from '../controllers/ratingController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/bookings/:bookingId', authenticate, submitRating);
router.get('/bookings/:bookingId', authenticate, getRatingForBooking);

export default router;
