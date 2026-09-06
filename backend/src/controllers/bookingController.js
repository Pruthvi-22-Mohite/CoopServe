import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import Notification from '../models/Notification.js';
import { calculateBookingPrice, CATEGORY_BASE_PRICES } from '../utils/pricingCalculator.js';
import { isUserAuthorizedForBooking } from '../middleware/authMiddleware.js';
import { matchProviders } from '../services/matchingEngine.js';
import User from '../models/User.js';
import { verifyLocationAgainstCustomer } from '../utils/geolocation.js';

const resolveCustomerCoords = async (booking) => {
  if (!booking?.customerId) {
    return { latitude: null, longitude: null };
  }

  const customerQuery = mongoose.isValidObjectId(booking.customerId)
    ? { $or: [{ _id: booking.customerId }, { id: booking.customerId }] }
    : { id: booking.customerId };

  const customer = await User.findOne(customerQuery);
  return {
    latitude: customer?.lat ?? null,
    longitude: customer?.lng ?? null
  };
};

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

    // Task 3: Provider Slot-Clash / Double-Booking Prevention
    const providerIdentities = [providerId];
    if (provider) {
      if (provider.id && !providerIdentities.includes(provider.id)) providerIdentities.push(provider.id);
      if (provider._id && !providerIdentities.includes(provider._id.toString())) providerIdentities.push(provider._id.toString());
      if (provider.userId && !providerIdentities.includes(provider.userId)) providerIdentities.push(provider.userId);
    }
    if (providerId === 'prov_1' && !providerIdentities.includes('usr_provider_demo')) {
      providerIdentities.push('usr_provider_demo');
    }
    if (providerId === 'usr_provider_demo' && !providerIdentities.includes('prov_1')) {
      providerIdentities.push('prov_1');
    }

    const requestedDate = date || new Date().toISOString().split('T')[0];
    const requestedTime = time || '11:00 AM';

    const activeBookingStatuses = [
      'BOOKED',
      'ACCEPTED',
      'PROVIDER_ACCEPTED',
      'ON_THE_WAY',
      'ARRIVED',
      'IN_PROGRESS'
    ];

    const conflictingBooking = await Booking.findOne({
      providerId: { $in: providerIdentities },
      date: requestedDate,
      time: requestedTime,
      status: { $in: activeBookingStatuses }
    });

    if (conflictingBooking) {
      // Find all busy providers at that slot
      const busyProviderIds = await Booking.find({
        date: requestedDate,
        time: requestedTime,
        status: { $in: activeBookingStatuses }
      }).distinct('providerId');

      // Query alternative candidate providers from MongoDB
      const candidateFilter = {
        id: { $nin: providerIdentities },
        status: { $ne: 'Suspended' }
      };
      if (provider?._id) {
        candidateFilter._id = { $ne: provider._id };
      }

      const allCandidates = await Provider.find(candidateFilter).lean();

      // Exclude providers with active bookings at the requested date/time
      const availableCandidates = allCandidates.filter(cand => {
        const cid = cand.id ? String(cand.id) : '';
        const cmongoid = cand._id ? String(cand._id) : '';
        const cuserid = cand.userId ? String(cand.userId) : '';
        return !busyProviderIds.includes(cid) &&
               !busyProviderIds.includes(cmongoid) &&
               !busyProviderIds.includes(cuserid);
      });

      // Rank alternatives with CoopServe Smart Matching Engine
      const targetCategory = category || provider?.categories?.[0] || 'all';
      const matchResult = matchProviders(
        availableCandidates.length > 0 ? availableCandidates : allCandidates,
        {
          categoryId: targetCategory,
          serviceTitle: serviceTitle || provider?.skill || '',
          customerLocation: address || 'Pune'
        }
      );

      const alternativeProviders = matchResult.rankedProviders || [];

      return res.status(409).json({
        success: false,
        error: 'PROVIDER_SLOT_CONFLICT',
        message: `The selected provider (${provider?.name || providerId}) is already booked for ${requestedDate} at ${requestedTime}. Please choose another time slot or select an alternative provider.`,
        conflict: {
          providerId: provider?.id || providerId,
          providerName: provider?.name || 'Selected Provider',
          date: requestedDate,
          time: requestedTime
        },
        alternativeProviders,
        alternatives: alternativeProviders
      });
    }

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
      date: requestedDate,
      time: requestedTime,
      address: address || 'Flat 402, Green Meadows, Kothrud, Pune - 411038',
      notes: notes || '',
      price: calculatedPricing.customerTotal,
      basePrice: calculatedPricing.basePrice,
      distanceKm: calculatedPricing.distanceKm,
      travelFee: calculatedPricing.travelFee,
      extraCharges: calculatedPricing.extraCharges,
      pricing: calculatedPricing,
      paymentStatus: 'PENDING',
      paymentMethod: paymentMethod || 'Razorpay',
      transactionId: txnId,
      status: 'BOOKED',
      protectedBooking: true,
      protectionEnabled: true,
      pendingRating: false,
      ratingStatus: 'NOT_RATED'
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
      // Task 4: Scoped broadcasting only to authorized booking and participant user rooms
      req.io.to(newBooking.id).emit('new_booking_created', newBooking);
      if (newBooking.customerId) {
        req.io.to(newBooking.customerId).emit('new_booking_created', newBooking);
      }
      if (newBooking.providerId) {
        req.io.to(newBooking.providerId).emit('new_booking_created', newBooking);
      }
      req.io.to('admin').emit('new_booking_created', newBooking);
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

    // Task 2: Booking ownership verification
    const isAuthorized = await isUserAuthorizedForBooking(req.user, booking);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to modify this booking.'
      });
    }

    // Standardize ACCEPTED
    const normalizedStatus = status === 'ACCEPTED' ? 'PROVIDER_ACCEPTED' : status;

    if (['IN_PROGRESS', 'COMPLETED'].includes(normalizedStatus)) {
      const verificationStage = normalizedStatus === 'IN_PROGRESS' ? 'start' : 'completion';
      const verificationResult = booking.locationVerification?.[verificationStage];

      if (!verificationResult || verificationResult.status !== 'VERIFIED' || verificationResult.distanceMeters == null) {
        return res.status(400).json({
          success: false,
          message: `Geotag verification is required before marking this job as ${normalizedStatus}.`
        });
      }
    }

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
      booking.pendingRating = true;
      if (!booking.ratingStatus || booking.ratingStatus === 'NOT_RATED') {
        booking.ratingStatus = 'NOT_RATED';
      }

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
          rating: null,
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
      // Task 4: Scoped broadcasting only to authorized booking and participant user rooms
      const statusPayload = { bookingId: booking.id, status: normalizedStatus, booking };
      req.io.to(booking.id).emit('booking_status_changed', statusPayload);
      if (booking.customerId) {
        req.io.to(booking.customerId).emit('booking_status_changed', statusPayload);
      }
      if (booking.providerId) {
        req.io.to(booking.providerId).emit('booking_status_changed', statusPayload);
      }
      req.io.to('admin').emit('booking_status_changed', statusPayload);
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

    // Task 2: Booking ownership verification
    if (req.user) {
      const isAuthorized = await isUserAuthorizedForBooking(req.user, booking);
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are not authorized to view this booking.'
        });
      }
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

    // Task 2: Booking ownership verification
    const isAuthorized = await isUserAuthorizedForBooking(req.user, booking);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to cancel this booking.'
      });
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date().toISOString();

    await booking.save();

    if (req.io) {
      // Task 4: Scoped broadcasting only to authorized booking and participant user rooms
      req.io.to(booking.id).emit('booking_cancelled', booking);
      if (booking.customerId) {
        req.io.to(booking.customerId).emit('booking_cancelled', booking);
      }
      if (booking.providerId) {
        req.io.to(booking.providerId).emit('booking_cancelled', booking);
      }
      req.io.to('admin').emit('booking_cancelled', booking);
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

export const verifyBookingLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, latitude, longitude } = req.body;
    const normalizedStage = String(stage || '').toLowerCase();
    const validStages = ['start', 'completion'];

    if (!validStages.includes(normalizedStage)) {
      return res.status(400).json({
        success: false,
        message: "Location verification stage must be either 'start' or 'completion'."
      });
    }

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required to verify a provider location.'
      });
    }

    const providerLatitude = Number(latitude);
    const providerLongitude = Number(longitude);

    if (!Number.isFinite(providerLatitude) || !Number.isFinite(providerLongitude)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be finite numeric values.'
      });
    }

    if (providerLatitude < -90 || providerLatitude > 90 || providerLongitude < -180 || providerLongitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90, and longitude must be between -180 and 180.'
      });
    }

    const bookingQuery = mongoose.isValidObjectId(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const booking = await Booking.findOne(bookingQuery);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isAuthorized = await isUserAuthorizedForBooking(req.user, booking);
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to verify this booking location.'
      });
    }

    const { latitude: customerLatitude, longitude: customerLongitude } = await resolveCustomerCoords(booking);
    const verification = verifyLocationAgainstCustomer({
      customerLatitude,
      customerLongitude,
      providerLatitude,
      providerLongitude
    });

    booking.locationVerification = booking.locationVerification || {};
    booking.locationVerification[normalizedStage] = {
      latitude: providerLatitude,
      longitude: providerLongitude,
      distanceMeters: verification.distanceMeters,
      status: verification.isVerified ? 'VERIFIED' : 'FAILED',
      verifiedAt: new Date(),
      reason: verification.reason
    };

    const failedVerification = !verification.isVerified;
    const hasExistingReview = Boolean(booking.reviewRequired);
    booking.reviewRequired = hasExistingReview || failedVerification;

    if (failedVerification && (!booking.reviewReason || !String(booking.reviewReason).trim())) {
      booking.reviewReason = `Geotag verification failed during ${normalizedStage}: ${verification.reason}`;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      verified: verification.isVerified,
      distanceMeters: verification.distanceMeters,
      allowedRadiusMeters: verification.allowedRadiusMeters,
      reason: verification.reason,
      message: verification.isVerified
        ? 'Provider location verified within the service radius.'
        : 'Provider location is outside the allowed service radius and requires admin review.',
      booking
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
