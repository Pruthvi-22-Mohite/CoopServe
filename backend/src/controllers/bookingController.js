import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import Notification from '../models/Notification.js';
import { inMemoryStore } from '../store/inMemoryStore.js';
import { calculateBookingPrice, CATEGORY_BASE_PRICES } from '../utils/pricingCalculator.js';

export const getBookings = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_customer_demo';
    const role = req.user?.role || 'CUSTOMER';

    const mongoCount = await Booking.countDocuments();

    if (mongoCount > 0) {
      let mongoFilter = {};

      if (role === 'SERVICE_PROVIDER') {
        mongoFilter = {
          $or: [
            { providerId: userId },
            { providerId: 'usr_provider_demo' },
            { providerName: { $regex: 'Rahul', $options: 'i' } }
          ]
        };
        let bookings = await Booking.find(mongoFilter).sort({ createdAt: -1 });
        if (bookings.length === 0) {
          bookings = await Booking.find({}).sort({ createdAt: -1 });
        }
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
    }

    // Fallback to in-memory store if MongoDB has no bookings yet
    let bookings;
    if (role === 'SERVICE_PROVIDER') {
      bookings = inMemoryStore.bookings.filter(
        b => b.providerId === userId || b.providerId === 'usr_provider_demo' || b.providerName?.includes('Rahul')
      );
      if (bookings.length === 0) {
        bookings = inMemoryStore.bookings;
      }
    } else if (role === 'ADMIN') {
      bookings = inMemoryStore.bookings;
    } else {
      bookings = inMemoryStore.getBookingsByCustomer(userId);
    }

    return res.status(200).json({
      success: true,
      bookings,
      total: bookings.length
    });
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

    // Lookup provider in MongoDB first, then in-memory store
    const providerQuery = mongoose.isValidObjectId(providerId)
      ? { $or: [{ _id: providerId }, { id: providerId }] }
      : { id: providerId };

    let provider = await Provider.findOne(providerQuery);
    if (!provider) {
      provider = inMemoryStore.getProviderById(providerId);
    }

    const resolvedBasePrice = Number(
      basePrice ||
      pricing?.basePrice ||
      price ||
      provider?.startingPrice ||
      CATEGORY_BASE_PRICES[category || provider?.categories?.[0]] ||
      400
    );

    const resolvedDistanceKm = distanceKm !== undefined
      ? Number(distanceKm)
      : (pricing?.distanceKm !== undefined
          ? Number(pricing.distanceKm)
          : (provider?.distanceKm !== undefined ? Number(provider.distanceKm) : 3.2));

    const resolvedExtraCharges = Number(extraCharges !== undefined ? extraCharges : (pricing?.extraCharges || 0));

    const calculatedPricing = pricing || calculateBookingPrice({
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
      price: price || calculatedPricing.customerTotal || provider?.startingPrice || 400,
      basePrice: resolvedBasePrice,
      distanceKm: resolvedDistanceKm,
      travelFee: travelFee !== undefined ? travelFee : calculatedPricing.travelFee,
      extraCharges: resolvedExtraCharges,
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

    // Keep inMemoryStore in sync for unmigrated components (chat, admin, etc.)
    const plainBooking = newBooking.toObject ? newBooking.toObject() : newBooking;
    inMemoryStore.bookings.unshift(plainBooking);

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

    // Also keep in-memory store in sync
    inMemoryStore.notifications.unshift({
      id: `notif_${Date.now()}_cust`,
      userId: newBooking.customerId,
      title: 'Protected Booking Confirmed!',
      message: `Your booking for ${newBooking.serviceTitle} is confirmed with ${newBooking.providerName}. ID: ${newBooking.id}`,
      type: 'BOOKING_CONFIRMED',
      read: false,
      createdAt: new Date().toISOString()
    });

    inMemoryStore.notifications.unshift({
      id: `notif_${Date.now()}_prov`,
      userId: newBooking.providerId,
      title: 'New Service Request Assigned!',
      message: `New booking for ${newBooking.serviceTitle} from ${newBooking.customerName}. Estimated earnings: ₹${calculatedPricing.workerEarnings}.`,
      type: 'JOB_REQUEST',
      read: false,
      createdAt: new Date().toISOString()
    });

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

    let booking = await Booking.findOne(bookingQuery);
    let isMongoBooking = true;

    if (!booking) {
      booking = inMemoryStore.getBookingById(id);
      isMongoBooking = false;
    }

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

      // Record verified work history in Mongo Provider and in-memory store
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

      const inMemProvider = inMemoryStore.getProviderById(booking.providerId);
      if (inMemProvider) {
        inMemProvider.jobsCompleted = (inMemProvider.jobsCompleted || 0) + 1;
        if (!inMemProvider.workHistory) inMemProvider.workHistory = [];
        inMemProvider.workHistory.unshift({
          id: booking.id,
          customer: booking.customerName,
          service: booking.serviceTitle,
          date: booking.date,
          rating: 5.0,
          verified: true
        });
      }
    } else if (normalizedStatus === 'REJECTED') {
      notificationTitle = 'Pro Unavailable - Auto Reassigning';
      notificationMessage = `Provider was unavailable. CoopServe AI is finding the next best balanced match for you.`;
    }

    if (isMongoBooking) {
      await booking.save();
      const inMemBooking = inMemoryStore.getBookingById(booking.id);
      if (inMemBooking) {
        inMemBooking.status = normalizedStatus;
        inMemBooking.updatedAt = booking.updatedAt;
        if (booking.completedAt) inMemBooking.completedAt = booking.completedAt;
      }
    }

    // Push notification to customer (MongoDB + in-memory sync)
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

    inMemoryStore.notifications.unshift({
      id: `notif_${Date.now()}_status`,
      userId: booking.customerId,
      title: notificationTitle,
      message: notificationMessage,
      type: 'STATUS_UPDATE',
      read: false,
      createdAt: new Date().toISOString()
    });

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

    let booking = await Booking.findOne(bookingQuery);
    if (!booking) {
      booking = inMemoryStore.getBookingById(id);
    }

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

    let booking = await Booking.findOne(bookingQuery);
    let isMongoBooking = true;

    if (!booking) {
      booking = inMemoryStore.getBookingById(id);
      isMongoBooking = false;
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date().toISOString();

    if (isMongoBooking) {
      await booking.save();
      const inMemBooking = inMemoryStore.getBookingById(booking.id);
      if (inMemBooking) {
        inMemBooking.status = 'CANCELLED';
        inMemBooking.cancellationReason = booking.cancellationReason;
        inMemBooking.cancelledAt = booking.cancelledAt;
      }
    }

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

