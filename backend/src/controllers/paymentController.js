import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// ---------------------------------------------------------------------------
// Razorpay client — initialized lazily so missing env vars don't crash startup
// ---------------------------------------------------------------------------
let razorpayClient = null;

const getRazorpay = () => {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables.'
      );
    }

    razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayClient;
};

// ---------------------------------------------------------------------------
// POST /api/payments/create-order
// Auth: authenticated customer
// Body: { bookingId }
// Returns: { razorpayKeyId, razorpayOrderId, amount, currency, bookingId }
// ---------------------------------------------------------------------------
export const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required.' });
    }

    // Find booking in MongoDB
    const bookingQuery = mongoose.isValidObjectId(bookingId)
      ? { $or: [{ _id: bookingId }, { id: bookingId }] }
      : { id: bookingId };

    const booking = await Booking.findOne(bookingQuery);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Verify the requesting user is the booking's customer
    const custId = String(booking.customerId);
    const uid = String(userId);
    if (custId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not the customer for this booking.'
      });
    }

    // Only create a new order if payment is still pending
    if (booking.paymentStatus === 'PAID') {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been paid.',
        paymentStatus: 'PAID'
      });
    }

    // Amount from authoritative backend pricing: exactly 25% customer upfront payment (Requirement 8)
    const totalBookingAmount = booking.pricing?.customerTotal || booking.price || 400;
    const upfrontPayable = booking.pricing?.upfrontPayable !== undefined
      ? booking.pricing.upfrontPayable
      : Math.round(totalBookingAmount * 0.25);
    const amountPaise = Math.round(upfrontPayable * 100);
    const currency = 'INR';

    const rzp = getRazorpay();

    const order = await rzp.orders.create({
      amount: amountPaise,
      currency,
      receipt: booking.id,
      notes: {
        bookingId: booking.id,
        customerId: booking.customerId,
        serviceTitle: booking.serviceTitle,
        totalBookingAmount,
        upfrontPayable,
        paymentType: 'UPFRONT_25_PERCENT'
      }
    });

    // Store the Razorpay Order ID against the booking
    const updateQuery = mongoose.isValidObjectId(booking._id?.toString())
      ? { _id: booking._id }
      : { id: booking.id };

    await Booking.findOneAndUpdate(updateQuery, {
      razorpayOrderId: order.id,
      paymentStatus: 'PENDING'
    });

    return res.status(200).json({
      success: true,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: order.id,
      amount: amountPaise,
      currency,
      bookingId: booking.id
    });
  } catch (err) {
    console.error('[Payment] createOrder error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/payments/webhook
// No auth — called by Razorpay servers
// Uses raw request body for HMAC-SHA256 signature verification
// ---------------------------------------------------------------------------
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not set.');
      return res.status(500).json({ success: false, message: 'Webhook secret not configured.' });
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing webhook signature.' });
    }

    // req.rawBody is set by the raw body middleware in server.js (only for this route)
    const rawBody = req.rawBody;
    if (!rawBody) {
      return res.status(400).json({ success: false, message: 'Missing raw request body.' });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Webhook] Invalid signature — possible spoofed webhook rejected.');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    // Parse and handle event
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[Webhook] Received event: ${eventType}`);

    if (eventType === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (!payment) {
        return res.status(400).json({ success: false, message: 'Missing payment entity.' });
      }

      const { order_id: orderId, id: paymentId, amount, status } = payment;

      if (status !== 'captured') {
        return res.status(200).json({ success: true, message: 'Payment not yet captured — ignored.' });
      }

      // Find booking by Razorpay Order ID
      const booking = await Booking.findOne({ razorpayOrderId: orderId });

      if (!booking) {
        console.warn(`[Webhook] No booking found for Razorpay order: ${orderId}`);
        // Return 200 to prevent Razorpay retrying for unknown orders
        return res.status(200).json({ success: true, message: 'No matching booking found.' });
      }

      // Idempotency: if already paid, do nothing
      if (booking.paymentStatus === 'PAID') {
        console.log(`[Webhook] Booking ${booking.id} already marked PAID — skipping.`);
        return res.status(200).json({ success: true, message: 'Already processed.' });
      }

      // Verify the amount matches to prevent partial-payment attacks
      const expectedAmountPaise = Math.round(
        (booking.pricing?.customerTotal || booking.price || 0) * 100
      );
      if (amount < expectedAmountPaise) {
        console.error(`[Webhook] Amount mismatch! Expected ${expectedAmountPaise}, got ${amount}`);
        return res.status(400).json({ success: false, message: 'Payment amount mismatch.' });
      }

      // Mark booking as PAID
      booking.paymentStatus = 'PAID';
      booking.razorpayPaymentId = paymentId;
      booking.paidAt = new Date().toISOString();
      booking.paymentMethod = 'Razorpay';
      booking.updatedAt = new Date().toISOString();
      await booking.save();

      // Notify customer
      try {
        await Notification.create({
          id: `notif_${Date.now()}_pay`,
          userId: booking.customerId,
          title: 'Payment Confirmed!',
          message: `Payment of ₹${(booking.pricing?.customerTotal || booking.price || 0)} for ${booking.serviceTitle} has been verified and confirmed.`,
          type: 'PAYMENT_CONFIRMED',
          read: false
        });
      } catch (notifErr) {
        console.warn('[Webhook] Notification error:', notifErr.message);
      }

      console.log(`[Webhook] Booking ${booking.id} marked PAID. Razorpay Payment ID: ${paymentId}`);
      return res.status(200).json({ success: true, message: 'Payment verified and booking updated.' });
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await Booking.findOneAndUpdate(
          { razorpayOrderId: payment.order_id, paymentStatus: 'PENDING' },
          { paymentStatus: 'FAILED', updatedAt: new Date().toISOString() }
        );
        console.log(`[Webhook] Booking for order ${payment.order_id} marked FAILED.`);
      }
      return res.status(200).json({ success: true, message: 'Payment failure recorded.' });
    }

    // All other events acknowledged
    return res.status(200).json({ success: true, message: `Event ${eventType} acknowledged.` });
  } catch (err) {
    console.error('[Webhook] Processing error:', err.message);
    return res.status(500).json({ success: false, message: 'Webhook processing error.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/payments/booking/:bookingId/status
// Auth: booking owner or admin
// Used by frontend to poll payment status after Razorpay checkout callback
// ---------------------------------------------------------------------------
export const getPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    const bookingQuery = mongoose.isValidObjectId(bookingId)
      ? { $or: [{ _id: bookingId }, { id: bookingId }] }
      : { id: bookingId };

    const booking = await Booking.findOne(bookingQuery);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Authorization: customer must own this booking, or admin
    const isAdmin = (role || '').toUpperCase() === 'ADMIN';
    const isOwner = String(booking.customerId) === String(userId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view this payment.'
      });
    }

    return res.status(200).json({
      success: true,
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      razorpayOrderId: booking.razorpayOrderId || null,
      razorpayPaymentId: booking.razorpayPaymentId || null,
      paidAt: booking.paidAt || null
    });
  } catch (err) {
    console.error('[Payment] getPaymentStatus error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
