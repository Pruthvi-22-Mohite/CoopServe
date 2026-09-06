import mongoose from 'mongoose';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';
import { matchProviders } from '../services/matchingEngine.js';
import { generateAIDemandInsights } from '../services/aiInsightsService.js';

export const getAdminDashboardStats = async (req, res) => {
  try {
    const customerCount = await User.countDocuments({ role: 'CUSTOMER' });
    const totalCustomers = 1420 + customerCount;

    const mongoProvidersCount = await Provider.countDocuments({ status: 'Active' });
    const allProvidersCount = await Provider.countDocuments();
    const activeProviders = mongoProvidersCount || allProvidersCount;

    const liveBookingsCount = await Booking.countDocuments();
    const totalBookings = liveBookingsCount + 1240;

    const completedBookings = await Booking.find({ status: 'COMPLETED' });

    const liveWorkerEarnings = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.workerEarnings || 450),
      0
    );
    const livePlatformOps = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.platformOperations || b.pricing?.platformFee || 50),
      0
    );

    const totalWorkerEarnings = 558000 + liveWorkerEarnings;
    const platformRevenue = 62000 + livePlatformOps;
    const cancellationRate = '2.4%';
    const averageRating = 4.88;
    const providerUtilization = '92%';

    const recentBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        activeProviders,
        todayBookings: liveBookingsCount,
        completedServices: totalBookings,
        totalWorkerEarnings,
        platformRevenue,
        providerUtilization,
        averageRating,
        cancellationRate,
        recentBookings,
        revenueTrend: [
          { month: 'Apr', gross: 240000, workerEarnings: 216000, platformOps: 24000 },
          { month: 'May', gross: 290000, workerEarnings: 261000, platformOps: 29000 },
          { month: 'Jun', gross: 360000, workerEarnings: 324000, platformOps: 36000 },
          { month: 'Jul', gross: 420000, workerEarnings: 378000, platformOps: 42000 },
          { month: 'Aug', gross: 490000, workerEarnings: 441000, platformOps: 49000 },
          { month: 'Sep', gross: 560000, workerEarnings: 504000, platformOps: 56000 }
        ],
        categoryBreakdown: [
          { name: 'Electrical', count: 1420, value: 710000 },
          { name: 'Plumbing', count: 1250, value: 625000 },
          { name: 'Cleaning', count: 980, value: 490000 },
          { name: 'Appliance Repair', count: 680, value: 340000 },
          { name: 'Carpentry', count: 561, value: 280500 }
        ]
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminProviders = async (req, res) => {
  try {
    const providersList = await Provider.find({});

    const providers = providersList.map(p => {
      const obj = p.toObject ? p.toObject() : p;
      return {
        ...obj,
        status: obj.status || 'Active',
        completedJobs: obj.jobsCompleted || 0,
        totalNetEarnings: Math.round((obj.jobsCompleted || 0) * (obj.startingPrice || 400) * 0.90)
      };
    });

    return res.status(200).json({
      success: true,
      providers,
      total: providers.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProviderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVerified } = req.body;

    const query = mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { id }] } : { id };
    const provider = await Provider.findOneAndUpdate(
      query,
      {
        $set: {
          ...(status !== undefined && { status }),
          ...(isVerified !== undefined && { isVerified: Boolean(isVerified) })
        }
      },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Provider status updated',
      provider
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminCustomers = async (req, res) => {
  try {
    const dbUsers = await User.find({ role: 'CUSTOMER' });

    const customers = await Promise.all(dbUsers.map(async (u) => {
      const uId = u.id || u._id.toString();
      const totalBookings = await Booking.countDocuments({
        $or: [{ customerId: uId }, ...(u.id ? [{ customerId: u.id }] : [])]
      });
      return {
        id: uId,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        location: u.location || '',
        totalBookings,
        rewardPoints: u.rewardsPoints || 0,
        status: 'Active',
        joinedDate: u.memberSince || (u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))
      };
    }));

    return res.status(200).json({
      success: true,
      customers,
      total: customers.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminMatchingInspection = async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(10);
    const providersDocs = await Provider.find({});
    const providers = providersDocs.map(p => (p.toObject ? p.toObject() : p));

    const activeDispatches = bookings.map((b) => {
      const provider = providers.find(p => p.id === b.providerId || p._id?.toString() === b.providerId) || providers[0] || null;
      const matchResult = providers.length > 0 ? matchProviders(providers, {
        categoryId: b.category,
        serviceTitle: b.serviceTitle
      }) : { rankedProviders: [], topMatch: null };
      const scoredProv = (provider && matchResult.rankedProviders?.find(p => p.id === provider.id)) || matchResult.topMatch;

      return {
        bookingId: b.id,
        serviceTitle: b.serviceTitle,
        category: b.category,
        customerName: b.customerName,
        assignedProvider: provider?.name || 'Assigned Provider',
        providerSkill: provider?.skill || 'Certified Pro',
        matchScore: scoredProv?.matchScore || 90,
        scoreBreakdown: scoredProv?.scoreBreakdown || {
          skillScore: 90,
          distanceScore: 90,
          availabilityScore: 90,
          ratingScore: 90,
          workloadFairnessScore: 85,
          trustScore: 90
        },
        reasons: scoredProv?.reasons || ['Required skill match', 'Fair workload balancing priority']
      };
    });

    return res.status(200).json({
      success: true,
      activeDispatches,
      weights: {
        skill: '30%',
        distance: '15%',
        availability: '15%',
        rating: '15%',
        workloadFairness: '10%',
        trustScore: '10%',
        experience: '5%'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminCancellationAndLeakage = async (req, res) => {
  try {
    const liveBookingCount = await Booking.countDocuments();
    const totalBookings = 4890 + liveBookingCount;
    const totalCancellations = 118;
    const customerCancellations = 78;
    const providerCancellations = 40;
    const cancellationAfterAssignment = 32;

    const visibleRiskSignals = [
      {
        id: 'sig_1',
        pattern: 'Post-Assignment Rapid Cancellation',
        severity: 'Moderate',
        affectedCount: '3.2% of bookings',
        observation: 'Booking cancelled within 10 minutes of technician dispatch and contact details exchanged.',
        systemReason: 'High cancellation rate observed shortly after provider assignment.',
        recommendedIntervention: 'Reinforce 30-day warranty value and dispute coverage notifications to customer upon dispatch.'
      },
      {
        id: 'sig_2',
        pattern: 'Frequent Single-Customer Rescheduling',
        severity: 'Low',
        affectedCount: '1.4% of users',
        observation: 'Customer books and cancels repeatedly before final slot.',
        systemReason: 'Scheduling conflict or off-peak slot unavailability.',
        recommendedIntervention: 'Display real-time provider slot availability calendar.'
      }
    ];

    return res.status(200).json({
      success: true,
      analytics: {
        totalBookings,
        totalCancellations,
        cancellationRate: '2.4%',
        customerCancellations,
        providerCancellations,
        cancellationAfterAssignment,
        visibleRiskSignals,
        retentionPolicy: 'Value-First Anti-Leakage (Portable worker credits + 30-day warranty guarantee)'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminAIInsights = async (req, res) => {
  try {
    const providersDocs = await Provider.find({});
    const bookingsDocs = await Booking.find({});
    const providers = providersDocs.map(p => (p.toObject ? p.toObject() : p));
    const bookings = bookingsDocs.map(b => (b.toObject ? b.toObject() : b));

    const insights = generateAIDemandInsights(providers, bookings);
    return res.status(200).json(insights);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
