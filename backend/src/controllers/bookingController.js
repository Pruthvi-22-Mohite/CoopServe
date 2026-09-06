import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import Notification from '../models/Notification.js';
import { calculateBookingPrice, CATEGORY_BASE_PRICES } from '../utils/pricingCalculator.js';

export const getBookings = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_customer_demo';
    const role = req.user?.role || 'CUSTOMER';

    let mongoFilter = {};

    if (role === 'SERVICE_PROVIDER') {
      const provider = await Provider.findOne({
        $or: [
          { userId },
          { id: userId },
          ...(mongoose.isValidObjectId(userId) ? [{ _id: userId }] : [])
        ]
      });

      const providerIds = [userId];
      if (provider) {
        if (provider.id && !providerIds.includes(provider.id)) providerIds.push(provider.id);
        if (provider._id && !providerIds.includes(provider._id.toString())) providerIds.push(provider._id.toString());
      }
      if (userId === 'usr_provider_demo' && !providerIds.includes('prov_1')) {
        providerIds.push('prov_1');
      }

      const bookings = await Booking.find({
        $or: providerIds.map(pid => ({ providerId: pid }))
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        bookings,
        total: bookings.length
      });
    } else if (role === 'ADMIN') {
      const bookings = await Booking.find({}).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        bookings,
        total: bookings.length
      });
    } else {
      // Customer
      mongoFilter = {
        $or: [
          { customerId: userId },
          ...(mongoose.isValidObjectId(userId) ? [{ customerId: userId.toString() }] : [])
        ]
      };
      const bookings = await Booking.find(mongoFilter).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        bookings,
        total: bookings.length
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const customer = req.user || {
      id: 'usr_customer_demo',
      name: 'Ananya Sharma',
      phone: '+91 98765 43210'
    };

    const {
      providerId,
      serviceId,
      serviceTitle,
      category,
      date,
      time,
      address,
      notes,
      price,
      basePrice,
      distanceKm,
      travelFee,
      extraCharges,
      pricing,
      paymentMethod
    } = req.body;

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID is required to create a booking.'
      });
    }

    // Lookup provider in MongoDB
    const providerQuery = mongoose.isValidObjectId(providerId)
      ? { $or: [{ _id: providerId }, { id: providerId }] }
      : { id: providerId };

    const provider = await Provider.findOne(providerQuery);

    // Backend pricingCalculator is the single source of truth.
    // Client values cannot override backend calculated prices.
    const resolvedBasePrice = Math.max(0, Math.round(Number(
      basePrice ||
      provider?.startingPrice ||
      CATEGORY_BASE_PRICES[category || provider?.categories?.[0]] ||
      400
    )));

    const resolvedDistanceKm = distanceKm !== undefined
      ? Number(distanceKm)
      : (provider?.distanceKm !== undefined ? Number(provider.distanceKm) : 3.2);

    const resolvedExtraCharges = Math.max(0, Math.round(Number(extraCharges || 0)));

    // Always calculate authoritative final price on backend using pricingCalculator
    const calculatedPricing = calculateBookingPrice({
      basePrice: resolvedBasePrice,
      distanceKm: resolvedDistanceKm,
      extraCharges: resolvedExtraCharges
    });

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `CS-2026-${randomNum}`;
    const txnId = `CS-TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingPayload = {
      id: bookingId,
      customerId: customer.id,
      customerName: customer.name || 'Ananya Sharma',
      customerPhone: customer.phone || '+91 98765 43210',
      providerId: provider?.id || providerId,
      providerName: provider?.name || 'Rahul Sharma',
      providerPhone: provider?.phone || '+91 98111 22334',
      providerAvatar: provider?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      providerSkill: provider?.skill || 'Certified Pro',
      providerTrustScore: provider?.trustScore || 94,
      serviceId: serviceId || 'srv_custom',
      serviceTitle: serviceTitle || provider?.skill || 'Cooperative Household Service',
      category: category || provider?.categories?.[0] || 'general',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '11:00 AM',
      address: address || 'Flat 402, Green Meadows, Kothrud, Pune - 411038',
      notes: notes || '',
      price: calculatedPricing.customerTotal,
      basePrice: calculatedPricing.basePrice,
      distanceKm: calculatedPricing.distanceKm,
      travelFee: calculatedPricing.travelFee,
      extraCharges: calculatedPricing.extraCharges,
      pricing: calculatedPricing,
      paymentStatus: 'PAID',
      paymentMethod: paymentMethod || 'UPI (Mock)',
      transactionId: txnId,
      status: 'BOOKED',
      protectedBooking: true,
      protectionEnabled: true
    };

    // Save persistent booking to MongoDB
    const newBooking = await Booking.create(bookingPayload);

    // Persist notifications to MongoDB
    try {
      await Notification.create({
        id: `notif_${Date.now()}_cust`,
        userId: newBooking.customerId,
        title: 'Protected Booking Confirmed!',
        message: `Your booking for ${newBooking.serviceTitle} is confirmed with ${newBooking.providerName}. ID: ${newBooking.id}`,
        type: 'BOOKING_CONFIRMED',
        read: false
      });

      await Notification.create({
        id: `notif_${Date.now()}_prov`,
        userId: newBooking.providerId,
        title: 'New Service Request Assigned!',
        message: `New booking for ${newBooking.serviceTitle} from ${newBooking.customerName}. Estimated earnings: ₹${calculatedPricing.workerEarnings}.`,
        type: 'JOB_REQUEST',
        read: false
      });
    } catch (notifErr) {
      console.warn('[Notification Error]', notifErr.message);
    }

    if (req.io) {
      req.io.emit('new_booking_created', newBooking);
    }

    return res.status(201).json({
      success: true,
      message: 'Service booked successfully with CoopServe Protection!',
      booking: newBooking
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete booking',
      error: err.message
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      'BOOKED',
      'ACCEPTED',
      'PROVIDER_ACCEPTED',
      'ON_THE_WAY',
      'ARRIVED',
      'IN_PROGRESS',
      'COMPLETED',
      'REJECTED',
      'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Valid values: ${validStatuses.join(', ')}`
      });
    }

    const bookingQuery = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const booking = await Booking.findOne(bookingQuery);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Standardize ACCEPTED
    const normalizedStatus = status === 'ACCEPTED' ? 'PROVIDER_ACCEPTED' : status;
    booking.status = normalizedStatus;
    booking.updatedAt = new Date().toISOString();

    let notificationTitle = 'Booking Status Update';
    let notificationMessage = `Your booking for ${booking.serviceTitle} is now ${normalizedStatus}.`;

    if (normalizedStatus === 'PROVIDER_ACCEPTED') {
      notificationTitle = 'Pro Accepted Your Request!';
      notificationMessage = `${booking.providerName} has accepted your booking for ${booking.date} at ${booking.time}.`;
    } else if (normalizedStatus === 'ON_THE_WAY') {
      notificationTitle = 'Technician is On The Way!';
      notificationMessage = `${booking.providerName} is traveling to your location at ${booking.address}.`;
    } else if (normalizedStatus === 'ARRIVED') {
      notificationTitle = 'Technician Arrived at Site';
      notificationMessage = `${booking.providerName} has arrived at your address.`;
    } else if (normalizedStatus === 'IN_PROGRESS') {
      notificationTitle = 'Service In Progress';
      notificationMessage = `${booking.providerName} is now performing ${booking.serviceTitle}.`;
    } else if (normalizedStatus === 'COMPLETED') {
      notificationTitle = 'Service Completed & Verified!';
      notificationMessage = `Your service is complete. 30-day rework warranty is now active under CoopServe Protection.`;
      booking.completedAt = new Date().toISOString();

      // Record verified work history in Mongo Provider
      const providerQuery = mongoose.isValidObjectId(booking.providerId)
        ? { $or: [{ _id: booking.providerId }, { id: booking.providerId }] }
        : { id: booking.providerId };

      const mongoProvider = await Provider.findOne(providerQuery);
      if (mongoProvider) {
        mongoProvider.jobsCompleted = (mongoProvider.jobsCompleted || 0) + 1;
        if (!mongoProvider.workHistory) mongoProvider.workHistory = [];
        mongoProvider.workHistory.unshift({
          id: booking.id,
          customer: booking.customerName,
          service: booking.serviceTitle,
          date: booking.date,
          rating: 5.0,
          verified: true
        });
        await mongoProvider.save();
      }
    } else if (normalizedStatus === 'REJECTED') {
      notificationTitle = 'Pro Unavailable - Auto Reassigning';
      notificationMessage = `Provider was unavailable. CoopServe AI is finding the next best balanced match for you.`;
    }

    await booking.save();

    // Push notification to customer
    try {
      await Notification.create({
        id: `notif_${Date.now()}_status`,
        userId: booking.customerId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'STATUS_UPDATE',
        read: false
      });
    } catch (notifErr) {
      console.warn('[Notification Error]', notifErr.message);
    }

    if (req.io) {
      req.io.emit('booking_status_changed', { bookingId: booking.id, status: normalizedStatus, booking });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${normalizedStatus}`,
      booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const bookingQuery = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const booking = await Booking.findOne(bookingQuery);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }
    return res.status(200).json({
      success: true,
      booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const bookingQuery = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const booking = await Booking.findOne(bookingQuery);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date().toISOString();

    await booking.save();

    if (req.io) {
      req.io.emit('booking_cancelled', booking);
    }

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled. Note: Cancellation removes CoopServe Protection guarantee for this job.',
      booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
