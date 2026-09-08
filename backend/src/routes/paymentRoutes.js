import express from 'express';
import { createOrder, handleWebhook, getPaymentStatus, verifyPayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Webhook: NO auth middleware — Razorpay calls this directly.
// Raw body parsing is handled in server.js BEFORE express.json() global middleware.
router.post('/webhook', handleWebhook);

// Authenticated routes
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/booking/:bookingId/status', authenticate, getPaymentStatus);

export default router;
