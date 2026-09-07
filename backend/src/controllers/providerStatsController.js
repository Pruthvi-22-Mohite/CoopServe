import mongoose from 'mongoose';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';

const getBookingFinancials = (booking) => {
  const customerTotal = Math.max(0, Number(booking.pricing?.customerTotal ?? booking.price ?? 0));
  const platformFee = Math.max(0, Number(booking.pricing?.platformFee ?? booking.pricing?.platformOperations ?? Math.round(customerTotal * 0.10)));
  const workerEarnings = Math.max(0, Number(booking.pricing?.workerEarnings ?? customerTotal - platformFee));
  return { customerTotal, platformFee, workerEarnings };
};

const findProvider = async (userId) => {
  const query = mongoose.isValidObjectId(userId)
    ? { $or: [{ _id: userId }, { id: userId }, { userId }] }
    : { $or: [{ id: userId }, { userId }] };
  let provider = await Provider.findOne(query);
  if (!provider) {
    provider = await Provider.findOne({ id: 'usr_provider_demo' }) || await Provider.findOne({});
  }
  return provider;
};

export const getProviderDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id || 'usr_provider_demo';
    const provider = await findProvider(userId);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const providerIdVal = provider.id || (provider._id ? provider._id.toString() : userId);
    const providerIds = [providerIdVal, userId];
    if (provider.id && !providerIds.includes(provider.id)) providerIds.push(provider.id);
    if (provider._id && !providerIds.includes(provider._id.toString())) providerIds.push(provider._id.toString());
    if (userId === 'usr_provider_demo' && !providerIds.includes('prov_1')) providerIds.push('prov_1');

    const providerBookings = await Booking.find({
      $or: providerIds.map(pid => ({ providerId: pid }))
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

    return res.status(200).json({
      success: true,
      stats: {
        trustScore: provider.trustScore || 94,
        provider: {
          id: provider.id,
          name: provider.name,
          skill: provider.skill,
          location: provider.location,
          state: provider.location?.split(', ').pop() || '',
          city: provider.location?.split(', ').slice(-2, -1)[0] || '',
          latitude: provider.latitude,
          longitude: provider.longitude,
          rating: provider.rating || 0,
          trustScore: provider.trustScore || 94,
          jobsCompleted: (provider.jobsCompleted || 0) + completedJobs.length,
          isAvailable: provider.isAvailable ?? true,
          availabilityStatus: provider.availabilityStatus || 'Available Today',
          coopMemberId: provider.coopMemberId || 'COOP-MH-2024-001',
          workerId: provider.workerId || provider.id,
          vehicleAvailable: provider.vehicleAvailable ?? false,
          avatar: provider.avatar
        },
        metrics: {
          pendingRequestsCount: pendingRequests.length,
          todayJobsCount: todayJobs.length,
          activeJobsCount: activeJobs.length,
          completedJobsCount: completedJobs.length,
          todayEarnings,
          monthlyEarnings,
          rating: provider.rating || 0,
          trustScore: provider.trustScore || 94,
          coopParticipationScore: '96%'
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
    const provider = await findProvider(userId);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const providerIdVal = provider.id || (provider._id ? provider._id.toString() : userId);
    const providerIds = [providerIdVal, userId];
    if (provider.id && !providerIds.includes(provider.id)) providerIds.push(provider.id);
    if (provider._id && !providerIds.includes(provider._id.toString())) providerIds.push(provider._id.toString());
    if (userId === 'usr_provider_demo' && !providerIds.includes('prov_1')) providerIds.push('prov_1');

    const completedBookings = await Booking.find({
      $and: [
        { status: 'COMPLETED' },
        { paymentStatus: { $nin: ['FAILED', 'REFUNDED'] } },
        { $or: providerIds.map(pid => ({ providerId: pid })) }
      ]
    });
    const allBookings = await Booking.find({
      $or: providerIds.map(pid => ({ providerId: pid }))
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
    const provider = await findProvider(userId);

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
    const { isAvailable, availabilityStatus, serviceAreas, vehicleAvailable } = req.body;

    const query = mongoose.isValidObjectId(userId)
      ? { $or: [{ _id: userId }, { id: userId }, { userId }] }
      : { $or: [{ id: userId }, { userId }] };

    let provider = await Provider.findOne(query);
    if (!provider) {
      provider = await Provider.findOne({ id: 'usr_provider_demo' });
    }

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
