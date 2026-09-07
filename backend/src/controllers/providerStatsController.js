import mongoose from 'mongoose';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import User from '../models/User.js';

const getBookingFinancials = (booking) => {
  const customerTotal = Math.max(0, Number(booking.pricing?.customerTotal ?? booking.price ?? 0));
  const platformFee = Math.max(0, Number(booking.pricing?.platformFee ?? booking.pricing?.platformOperations ?? Math.round(customerTotal * 0.10)));
  const workerEarnings = Math.max(0, Number(booking.pricing?.workerEarnings ?? customerTotal - platformFee));
  return { customerTotal, platformFee, workerEarnings };
};

export const findProvider = async (userId, userEmail = '') => {
  if (!userId) return null;

  const query = mongoose.isValidObjectId(userId)
    ? { $or: [{ _id: userId }, { id: userId }, { userId }, { workerId: userId }] }
    : { $or: [{ id: userId }, { userId }, { workerId: userId }] };

  let provider = await Provider.findOne(query);

  if (!provider && userEmail) {
    provider = await Provider.findOne({ email: userEmail.toLowerCase() });
  }

  // If not found in Provider collection, check if a User exists and create or sync Provider
  if (!provider) {
    const userQuery = mongoose.isValidObjectId(userId)
      ? { $or: [{ _id: userId }, { id: userId }] }
      : { id: userId };
    const user = await User.findOne(userQuery);

    if (user && user.role === 'SERVICE_PROVIDER') {
      provider = await Provider.create({
        id: user.workerId || user.id || `prov_${user._id.toString()}`,
        userId: user.id || user._id.toString(),
        workerId: user.workerId || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 90000 00000',
        skill: user.skill || 'General Service',
        location: user.location || user.city || 'Pune',
        serviceAreas: user.neighbourhood ? [user.neighbourhood] : [],
        latitude: user.lat,
        longitude: user.lng,
        vehicleAvailable: user.vehicleAvailable ?? false,
        coopMemberId: user.coopMemberId || `COOP-MH-2026-${Math.floor(100 + Math.random() * 900)}`,
        startingPrice: user.startingPrice || 299,
        rating: 0,
        reviewsCount: 0,
        jobsCompleted: 0,
        isVerified: user.isVerified ?? false,
        isAvailable: user.isAvailable ?? true
      });
    } else if (userId === 'usr_provider_demo' || userEmail === 'provider@coopserve.demo') {
      provider = await Provider.findOne({ id: 'usr_provider_demo' }) || await Provider.findOne({});
    }
  }

  return provider;
};

export const getProviderDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_provider_demo';
    const userEmail = req.user?.email || '';
    const provider = await findProvider(userId, userEmail);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const providerIdVal = provider.id || (provider._id ? provider._id.toString() : userId);
    const providerIds = [providerIdVal, userId];
    if (provider.id && !providerIds.includes(provider.id)) providerIds.push(provider.id);
    if (provider._id && !providerIds.includes(provider._id.toString())) providerIds.push(provider._id.toString());
    if (provider.userId && !providerIds.includes(provider.userId)) providerIds.push(provider.userId);
    if (provider.workerId && !providerIds.includes(provider.workerId)) providerIds.push(provider.workerId);
    if (userId === 'usr_provider_demo' && !providerIds.includes('prov_1')) providerIds.push('prov_1');

    // Retrieve real provider bookings from MongoDB
    const providerBookings = await Booking.find({
      $or: providerIds.filter(Boolean).map(pid => ({ providerId: pid }))
    }).sort({ createdAt: -1 });

    const pendingRequests = providerBookings.filter(b => b.status === 'BOOKED');
    const todayJobs = providerBookings.filter(b => b.date === todayStr && b.status !== 'CANCELLED');
    const completedJobs = providerBookings.filter(
      (booking) => booking.status === 'COMPLETED' && !['FAILED', 'REFUNDED'].includes(booking.paymentStatus)
    );
    const activeJobs = providerBookings.filter(
      b => ['PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
    );

    const todayEarnings = todayJobs
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + getBookingFinancials(b).workerEarnings, 0);

    const monthlyEarnings = completedJobs.reduce(
      (sum, b) => sum + getBookingFinancials(b).workerEarnings,
      0
    );

    // Dynamic rating calculation from authentic MongoDB Review records only (Requirement 2)
    const reviews = await Review.find({
      providerId: { $in: providerIds.filter(Boolean) },
      isSuspicious: false
    }).lean();

    const validReviews = (reviews || []).filter(r => typeof r.rating === 'number' && r.rating > 0);
    const reviewsCount = validReviews.length;
    const dynamicRating = reviewsCount > 0
      ? parseFloat((validReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(2))
      : 0;

    // Dynamic Worker Cooperative Rewards Calculation (Requirement 3)
    // New worker = 0 points.
    // 10 Reward Points per verified completed job + 1 point for every ₹50 in net earnings.
    const completedJobsCount = completedJobs.length;
    const totalNetEarnings = monthlyEarnings;
    const rewardPoints = completedJobsCount === 0
      ? 0
      : (completedJobsCount * 10) + Math.floor(totalNetEarnings / 50);

    const rewardTier = rewardPoints >= 500
      ? 'Master Cooperative Artisan (Gold Tier)'
      : rewardPoints >= 100
      ? 'Certified Craftsman (Silver Tier)'
      : 'Associate Member (Bronze Tier)';

    const rewardsExplanation = 'Cooperative Reward Points are calculated from your actual completed work: 10 base points per verified completed job + 1 point for every ₹50 in net earnings. New workers start with 0 points. Cancelled, failed, or refunded bookings do not earn points.';

    return res.status(200).json({
      success: true,
      stats: {
        trustScore: provider.trustScore || 85,
        provider: {
          id: provider.id,
          userId: provider.userId || userId,
          name: provider.name,
          phone: provider.phone || '+91 90000 00000',
          email: provider.email,
          skill: provider.skill,
          location: provider.location,
          state: provider.location?.split(', ').pop() || '',
          city: provider.location?.split(', ').slice(-2, -1)[0] || '',
          latitude: provider.latitude,
          longitude: provider.longitude,
          rating: dynamicRating,
          reviewsCount,
          trustScore: provider.trustScore || 85,
          jobsCompleted: completedJobsCount,
          isAvailable: provider.isAvailable ?? true,
          availabilityStatus: provider.availabilityStatus || 'Available Today',
          coopMemberId: provider.coopMemberId || 'COOP-MH-2026-001',
          workerId: provider.workerId || provider.id,
          vehicleAvailable: provider.vehicleAvailable ?? false,
          avatar: provider.avatar
        },
        rewards: {
          points: rewardPoints,
          tier: rewardTier,
          completedJobsCount,
          explanation: rewardsExplanation
        },
        metrics: {
          pendingRequestsCount: pendingRequests.length,
          todayJobsCount: todayJobs.length,
          activeJobsCount: activeJobs.length,
          completedJobsCount,
          todayEarnings,
          monthlyEarnings,
          rating: dynamicRating,
          reviewsCount,
          trustScore: provider.trustScore || 85,
          coopParticipationScore: completedJobsCount > 0 ? '98%' : '100%'
        },
        pendingRequests,
        todayJobs,
        activeJobs,
        completedJobs,
        recentBookings: providerBookings.slice(0, 5),
        coopBenefits: {
          vocationalUpskilling: 'Advanced Solar & Smart Meter Certification',
          toolStandardSupport: 'Standardized Precision Equipment',
          safetyAssistance: 'Accident & Safety Coverage',
          peerMentorship: 'Senior Cooperative Craftsman'
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProviderEarnings = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_provider_demo';
    const userEmail = req.user?.email || '';
    const provider = await findProvider(userId, userEmail);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const providerIdVal = provider.id || (provider._id ? provider._id.toString() : userId);
    const providerIds = [providerIdVal, userId];
    if (provider.id && !providerIds.includes(provider.id)) providerIds.push(provider.id);
    if (provider._id && !providerIds.includes(provider._id.toString())) providerIds.push(provider._id.toString());
    if (provider.userId && !providerIds.includes(provider.userId)) providerIds.push(provider.userId);
    if (provider.workerId && !providerIds.includes(provider.workerId)) providerIds.push(provider.workerId);
    if (userId === 'usr_provider_demo' && !providerIds.includes('prov_1')) providerIds.push('prov_1');

    const completedBookings = await Booking.find({
      $and: [
        { status: 'COMPLETED' },
        { paymentStatus: { $nin: ['FAILED', 'REFUNDED'] } },
        { $or: providerIds.filter(Boolean).map(pid => ({ providerId: pid })) }
      ]
    });
    const allBookings = await Booking.find({
      $or: providerIds.filter(Boolean).map(pid => ({ providerId: pid }))
    }).sort({ createdAt: -1 });

    const uniqueCompletedBookings = [...new Map(completedBookings.map((booking) => [booking.id || booking._id.toString(), booking])).values()];
    const financialRows = uniqueCompletedBookings.map((booking) => ({ booking, ...getBookingFinancials(booking) }));
    const grossPayments = financialRows.reduce((sum, row) => sum + row.customerTotal, 0);
    const workerNetEarnings = financialRows.reduce((sum, row) => sum + row.workerEarnings, 0);
    const platformOps = financialRows.reduce((sum, row) => sum + row.platformFee, 0);
    const availablePayout = financialRows
      .filter(({ booking }) => booking.paymentStatus === 'PAID')
      .reduce((sum, row) => sum + row.workerEarnings, 0);
    const pendingPayout = financialRows
      .filter(({ booking }) => booking.paymentStatus !== 'PAID' && !['FAILED', 'REFUNDED'].includes(booking.paymentStatus))
      .reduce((sum, row) => sum + row.workerEarnings, 0);

    return res.status(200).json({
      success: true,
      earnings: {
        grossPayments,
        workerNetEarnings,
        netEarnings: workerNetEarnings,
        platformOps,
        netPayoutPercentage: workerNetEarnings > 0 && grossPayments > 0 ? `${Math.round((workerNetEarnings / grossPayments) * 100)}%` : '0%',
        availablePayout,
        pendingPayout,
        payoutAccount: null,
        breakdownList: allBookings.map((booking) => {
          const financials = getBookingFinancials(booking);
          const isEarningBooking = booking.status === 'COMPLETED' && !['FAILED', 'REFUNDED'].includes(booking.paymentStatus);
          return {
            bookingId: booking.id,
            date: booking.date,
            service: booking.serviceTitle,
            basePrice: Number(booking.pricing?.basePrice ?? booking.basePrice ?? 0),
            distanceKm: Number(booking.pricing?.distanceKm ?? booking.distanceKm ?? 0),
            travelFee: Number(booking.pricing?.travelFee ?? booking.travelFee ?? 0),
            extraCharges: Number(booking.pricing?.extraCharges ?? booking.extraCharges ?? 0),
            customerPaid: financials.customerTotal,
            netEarnings: isEarningBooking ? financials.workerEarnings : 0,
            platformOps: financials.platformFee,
            status: booking.status === 'CANCELLED' ? 'CANCELLED' : booking.paymentStatus === 'FAILED' ? 'PAYMENT_FAILED' : booking.status === 'COMPLETED' ? (booking.paymentStatus === 'PAID' ? 'AVAILABLE' : 'PENDING_PAYOUT') : 'NOT_COMPLETED'
          };
        })
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProviderAvailability = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_provider_demo';
    const userEmail = req.user?.email || '';
    const provider = await findProvider(userId, userEmail);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    return res.status(200).json({
      success: true,
      availability: {
        isAvailable: provider.isAvailable ?? true,
        availabilityStatus: provider.availabilityStatus || 'Available Today',
        serviceAreas: provider.serviceAreas || [],
        vehicleAvailable: provider.vehicleAvailable ?? false,
        workingHours: '08:00 AM - 08:00 PM',
        instantDispatchRadiusKm: 5.0
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProviderAvailability = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_provider_demo';
    const userEmail = req.user?.email || '';
    const { isAvailable, availabilityStatus, serviceAreas, vehicleAvailable } = req.body;

    const provider = await findProvider(userId, userEmail);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (isAvailable !== undefined) provider.isAvailable = Boolean(isAvailable);
    if (availabilityStatus) provider.availabilityStatus = availabilityStatus;
    if (serviceAreas) provider.serviceAreas = serviceAreas;
    if (vehicleAvailable !== undefined) provider.vehicleAvailable = Boolean(vehicleAvailable);
    await provider.save();

    return res.status(200).json({
      success: true,
      message: 'Availability preferences saved',
      availability: {
        isAvailable: provider.isAvailable,
        availabilityStatus: provider.availabilityStatus,
        serviceAreas: provider.serviceAreas,
        vehicleAvailable: provider.vehicleAvailable ?? false
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProviderProfile = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_provider_demo';
    const userEmail = req.user?.email || '';
    const { name, phone, skill, location, vehicleAvailable } = req.body;

    const provider = await findProvider(userId, userEmail);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    if (name) provider.name = name.trim();
    if (phone) provider.phone = phone.trim();
    if (skill) provider.skill = skill.trim();
    if (location) provider.location = location.trim();
    if (vehicleAvailable !== undefined) provider.vehicleAvailable = Boolean(vehicleAvailable);
    await provider.save();

    // Also update corresponding User document in MongoDB
    const userQuery = mongoose.isValidObjectId(userId)
      ? { $or: [{ _id: userId }, { id: userId }] }
      : { id: userId };
    const user = await User.findOne(userQuery);
    if (user) {
      if (name) user.name = name.trim();
      if (phone) user.phone = phone.trim();
      if (skill) user.skill = skill.trim();
      if (location) user.location = location.trim();
      if (vehicleAvailable !== undefined) user.vehicleAvailable = Boolean(vehicleAvailable);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Worker profile updated successfully',
      provider: {
        id: provider.id,
        name: provider.name,
        phone: provider.phone,
        email: provider.email,
        skill: provider.skill,
        location: provider.location,
        vehicleAvailable: provider.vehicleAvailable,
        rating: provider.rating,
        trustScore: provider.trustScore,
        coopMemberId: provider.coopMemberId,
        workerId: provider.workerId || provider.id
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
