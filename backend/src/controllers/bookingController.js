import { inMemoryStore } from '../store/inMemoryStore.js';

export const getBookings = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_customer_demo';
    const role = req.user?.role || 'CUSTOMER';

    let bookings;
    if (role === 'SERVICE_PROVIDER') {
      // For demo worker, also show bookings assigned to usr_provider_demo or match provider
      bookings = inMemoryStore.bookings.filter(
        b => b.providerId === userId || b.providerId === 'usr_provider_demo' || b.providerName?.includes('Rahul')
      );
      // If no specific bookings yet, show all active to test demo worker easily
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

    const provider = inMemoryStore.getProviderById(providerId);

    const bookingPayload = {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
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
      price: price || pricing?.customerTotal || provider?.startingPrice || 400,
      basePrice: basePrice || pricing?.basePrice || provider?.startingPrice || 400,
      distanceKm: distanceKm !== undefined ? distanceKm : (pricing?.distanceKm !== undefined ? pricing.distanceKm : provider?.distanceKm),
      travelFee: travelFee !== undefined ? travelFee : pricing?.travelFee,
      extraCharges: extraCharges !== undefined ? extraCharges : pricing?.extraCharges,
      pricing,
      paymentMethod: paymentMethod || 'UPI (Mock)'
    };

    const newBooking = inMemoryStore.addBooking(bookingPayload);

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

    const booking = inMemoryStore.getBookingById(id);
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

      // Record verified work history
      const provider = inMemoryStore.getProviderById(booking.providerId);
      if (provider) {
        provider.jobsCompleted = (provider.jobsCompleted || 0) + 1;
        if (!provider.workHistory) provider.workHistory = [];
        provider.workHistory.unshift({
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

    // Push notification to customer
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
    const booking = inMemoryStore.getBookingById(id);
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
    const booking = inMemoryStore.getBookingById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date().toISOString();

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
