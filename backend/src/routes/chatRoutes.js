import express from 'express';
import { getBookingMessages, sendBookingMessage } from '../controllers/chatController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:bookingId', authenticate, getBookingMessages);
router.post('/:bookingId', authenticate, sendBookingMessage);

export default router;
