import mongoose from 'mongoose';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';

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
    const completedJobs = providerBookings.filter(b => b.status === 'COMPLETED');
    const activeJobs = providerBookings.filter(
      b => ['PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
    );

    const todayEarnings = todayJobs
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (b.pricing?.workerEarnings || 450), 0);

    const monthlyEarnings = completedJobs.reduce(
      (sum, b) => sum + (b.pricing?.workerEarnings || 450),
      35100 // simulated base month baseline + live completions
    );

    return res.status(200).json({
      success: true,
      stats: {
        trustScore: provider.trustScore || 94,
        provider: {
          id: provider.id,
          name: provider.name,
          skill: provider.skill,
          rating: provider.rating || 4.88,
          trustScore: provider.trustScore || 94,
          jobsCompleted: (provider.jobsCompleted || 0) + completedJobs.length,
          isAvailable: provider.isAvailable ?? true,
          availabilityStatus: provider.availabilityStatus || 'Available Today',
          coopMemberId: provider.coopMemberId || 'COOP-MH-2024-001',
          avatar: provider.avatar
        },
        metrics: {
          pendingRequestsCount: pendingRequests.length,
          todayJobsCount: todayJobs.length,
          activeJobsCount: activeJobs.length,
          completedJobsCount: completedJobs.length,
          todayEarnings,
          monthlyEarnings,
          rating: provider.rating || 4.88,
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
        { $or: providerIds.map(pid => ({ providerId: pid })) }
      ]
    });
    const allBookings = await Booking.find({
      $or: providerIds.map(pid => ({ providerId: pid }))
    }).sort({ createdAt: -1 });

    const grossPayments = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.customerPayment || b.pricing?.customerTotal || 500),
      39000
    );
    const workerNetEarnings = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.workerEarnings || 450),
      35100
    );
    const platformOps = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.platformOperations || b.pricing?.platformFee || 50),
      3900
    );

    return res.status(200).json({
      success: true,
      earnings: {
        grossPayments,
        workerNetEarnings,
        netEarnings: workerNetEarnings,
        platformOps,
        netPayoutPercentage: '90%',
        payoutAccount: {
          bankName: 'HDFC Bank Ltd',
          accountNumberMasked: '•••• •••• 4102',
          ifscCode: 'HDFC0001234',
          nextPayoutDate: 'This Friday (Auto-settlement)'
        },
        breakdownList: allBookings.map(b => ({
          bookingId: b.id,
          date: b.date,
          service: b.serviceTitle,
          basePrice: b.pricing?.basePrice || 400,
          distanceKm: b.pricing?.distanceKm || 3.2,
          travelFee: b.pricing?.travelFee !== undefined ? b.pricing.travelFee : 20,
          extraCharges: b.pricing?.extraCharges || 0,
          customerPaid: b.pricing?.customerTotal || b.pricing?.customerPayment || 420,
          netEarnings: b.pricing?.workerEarnings || 378,
          platformOps: b.pricing?.platformFee || b.pricing?.platformOperations || 42,
          status: b.status === 'COMPLETED' ? 'PAID_OUT' : 'PENDING_SETTLEMENT'
        }))
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
        serviceAreas: provider.serviceAreas || ['Shivajinagar', 'Kothrud', 'Deccan', 'Aundh'],
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
    const { isAvailable, availabilityStatus, serviceAreas } = req.body;

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
    await provider.save();

    return res.status(200).json({
      success: true,
      message: 'Availability preferences saved',
      availability: {
        isAvailable: provider.isAvailable,
        availabilityStatus: provider.availabilityStatus,
        serviceAreas: provider.serviceAreas
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
