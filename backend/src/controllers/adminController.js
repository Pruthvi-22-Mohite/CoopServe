import { inMemoryStore } from '../store/inMemoryStore.js';
import { matchProviders } from '../services/matchingEngine.js';
import { generateAIDemandInsights } from '../services/aiInsightsService.js';

export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalCustomers = 1420;
    const activeProviders = inMemoryStore.providers.length;
    const totalBookings = inMemoryStore.bookings.length + 1240;
    const completedBookings = inMemoryStore.bookings.filter(b => b.status === 'COMPLETED');
    const cancelledBookings = inMemoryStore.bookings.filter(b => b.status === 'CANCELLED');

    const liveWorkerEarnings = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.workerEarnings || 450),
      0
    );
    const livePlatformOps = completedBookings.reduce(
      (sum, b) => sum + (b.pricing?.platformOperations || 50),
      0
    );

    const totalWorkerEarnings = 558000 + liveWorkerEarnings;
    const platformRevenue = 62000 + livePlatformOps;
    const cancellationRate = '2.4%';
    const averageRating = 4.88;
    const providerUtilization = '92%';

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        activeProviders,
        todayBookings: inMemoryStore.bookings.length,
        completedServices: totalBookings,
        totalWorkerEarnings,
        platformRevenue,
        providerUtilization,
        averageRating,
        cancellationRate,
        recentBookings: inMemoryStore.bookings.slice(0, 5),
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
    const providers = inMemoryStore.providers.map(p => ({
      ...p,
      status: p.status || 'Active',
      completedJobs: p.jobsCompleted || 50,
      totalNetEarnings: Math.round((p.jobsCompleted || 50) * (p.startingPrice || 400) * 0.90)
    }));

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
    const provider = inMemoryStore.getProviderById(id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    if (status !== undefined) provider.status = status;
    if (isVerified !== undefined) provider.isVerified = Boolean(isVerified);

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
    const customers = [
      { id: 'usr_customer_demo', name: 'Ananya Sharma', email: 'customer@coopserve.demo', phone: '+91 98765 43210', location: 'Kothrud, Pune', totalBookings: inMemoryStore.bookings.length, rewardPoints: 450, status: 'Active', joinedDate: '12 Jan 2026' },
      { id: 'usr_cust_2', name: 'Vikram Mehta', email: 'vikram.mehta@gmail.com', phone: '+91 98230 11992', location: 'Aundh, Pune', totalBookings: 8, rewardPoints: 620, status: 'Active', joinedDate: '04 Feb 2026' },
      { id: 'usr_cust_3', name: 'Pooja Kulkarni', email: 'pooja.k@outlook.com', phone: '+91 98901 22883', location: 'Shivajinagar, Pune', totalBookings: 5, rewardPoints: 350, status: 'Active', joinedDate: '18 Feb 2026' },
      { id: 'usr_cust_4', name: 'Sanjay Shinde', email: 'sanjay.shinde@techcorp.in', phone: '+91 98555 44101', location: 'Baner, Pune', totalBookings: 12, rewardPoints: 940, status: 'Active', joinedDate: '02 Mar 2026' },
      { id: 'usr_cust_5', name: 'Dr. Anita Joshi', email: 'anita.joshi@punehealth.org', phone: '+91 98666 33219', location: 'Deccan, Pune', totalBookings: 6, rewardPoints: 480, status: 'Active', joinedDate: '15 Mar 2026' }
    ];

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
    const activeDispatches = inMemoryStore.bookings.map((b) => {
      const provider = inMemoryStore.getProviderById(b.providerId) || inMemoryStore.providers[0];
      const matchResult = matchProviders(inMemoryStore.providers, {
        categoryId: b.category,
        serviceTitle: b.serviceTitle
      });
      const scoredProv = matchResult.rankedProviders.find(p => p.id === provider.id) || matchResult.topMatch;

      return {
        bookingId: b.id,
        serviceTitle: b.serviceTitle,
        category: b.category,
        customerName: b.customerName,
        assignedProvider: provider.name,
        providerSkill: provider.skill,
        matchScore: scoredProv?.matchScore || 94,
        scoreBreakdown: scoredProv?.scoreBreakdown || {
          skillScore: 98,
          distanceScore: 91,
          availabilityScore: 100,
          ratingScore: 96,
          workloadFairnessScore: 85,
          trustScore: 94
        },
        reasons: scoredProv?.reasons || ['Required skill match', 'Available today', 'Fair workload balancing priority']
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
    const totalBookings = 4890 + inMemoryStore.bookings.length;
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
    const insights = generateAIDemandInsights(inMemoryStore.providers, inMemoryStore.bookings);
    return res.status(200).json(insights);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
