import mongoose from 'mongoose';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import { matchProviders } from '../services/matchingEngine.js';
import { generateAIDemandInsights } from '../services/aiInsightsService.js';
import { PLATFORM_FEE_PERCENT } from '../utils/pricingCalculator.js';

const ACTIVE_BOOKING_STATUSES = [
  'BOOKED',
  'ACCEPTED',
  'PROVIDER_ACCEPTED',
  'ON_THE_WAY',
  'ARRIVED',
  'IN_PROGRESS'
];

const PENDING_BOOKING_STATUSES = ['BOOKED', 'ACCEPTED'];
const IN_PROGRESS_BOOKING_STATUSES = ['PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'];
const COMPLETED_PAYMENT_EXCLUDE = ['FAILED'];

const stripSensitive = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = { ...obj };
  delete clone.password;
  delete clone.resetPasswordToken;
  delete clone.resetPasswordExpires;
  delete clone.tokenVersion;
  delete clone.razorpaySignature;
  return clone;
};

export const getBookingFinancials = (booking) => {
  const customerTotal = Math.max(0, Number(booking.pricing?.customerTotal ?? booking.price ?? 0));
  const storedPlatform = Number(booking.pricing?.platformFee ?? booking.pricing?.platformOperations);
  const platformFee = Number.isFinite(storedPlatform) && storedPlatform >= 0
    ? storedPlatform
    : Math.round(customerTotal * (PLATFORM_FEE_PERCENT / 100));
  const storedWorker = Number(booking.pricing?.workerEarnings);
  const workerEarnings = Number.isFinite(storedWorker) && storedWorker >= 0
    ? storedWorker
    : Math.max(0, customerTotal - platformFee);
  const refundAmount = Math.max(0, Number(
    booking.refundAmount ?? booking.pricing?.refundAmount ?? 0
  ));
  const cancellationDeduction = Math.max(0, Number(
    booking.cancellationDeduction ?? booking.pricing?.cancellationDeduction ?? 0
  ));
  return { customerTotal, platformFee, workerEarnings, refundAmount, cancellationDeduction };
};

const isCompletedForRevenue = (booking) =>
  booking.status === 'COMPLETED' && !COMPLETED_PAYMENT_EXCLUDE.includes(booking.paymentStatus);

const monthKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key) => {
  const [year, month] = key.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
};

const formatLocation = (entity) => {
  if (!entity) return '';
  if (entity.location) return entity.location;
  return [entity.neighbourhood, entity.city, entity.state].filter(Boolean).join(', ');
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalWorkerUsers,
      providers,
      bookings,
      reviews
    ] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }),
      User.countDocuments({ role: 'SERVICE_PROVIDER' }),
      Provider.find({}).lean(),
      Booking.find({}).sort({ createdAt: -1 }).lean(),
      Review.find({ isSuspicious: false }).lean()
    ]);

    const totalWorkers = Math.max(providers.length, totalWorkerUsers);
    const onDutyWorkers = providers.filter(
      (p) => p.isAvailable !== false && p.status !== 'Suspended' && p.status !== 'Pending'
    ).length;
    const activeProviders = providers.filter((p) => p.status === 'Active').length;

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => PENDING_BOOKING_STATUSES.includes(b.status)).length;
    const activeBookings = bookings.filter((b) => IN_PROGRESS_BOOKING_STATUSES.includes(b.status)).length;
    const completedBookingsList = bookings.filter(isCompletedForRevenue);
    const cancelledBookingsList = bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED');
    const completedServices = completedBookingsList.length;
    const cancelledBookings = cancelledBookingsList.length;

    const totals = completedBookingsList.reduce(
      (acc, booking) => {
        const fin = getBookingFinancials(booking);
        acc.gross += fin.customerTotal;
        acc.workerEarnings += fin.workerEarnings;
        acc.platformRevenue += fin.platformFee;
        return acc;
      },
      { gross: 0, workerEarnings: 0, platformRevenue: 0 }
    );

    const cancellationRateValue = totalBookings > 0
      ? (cancelledBookings / totalBookings) * 100
      : 0;

    const validReviews = (reviews || []).filter((r) => typeof r.rating === 'number' && r.rating > 0);
    const averageRating = validReviews.length > 0
      ? parseFloat((validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(2))
      : 0;

    const providerUtilization = totalWorkers > 0
      ? `${Math.round((onDutyWorkers / totalWorkers) * 100)}%`
      : '0%';

    const geoReviewCount = bookings.filter((b) => b.reviewRequired).length;

    const trendMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      trendMap[key] = { month: monthLabel(key), gross: 0, workerEarnings: 0, platformOps: 0 };
    }
    completedBookingsList.forEach((booking) => {
      const key = monthKey(booking.completedAt || booking.updatedAt || booking.createdAt);
      if (!key || !trendMap[key]) return;
      const fin = getBookingFinancials(booking);
      trendMap[key].gross += fin.customerTotal;
      trendMap[key].workerEarnings += fin.workerEarnings;
      trendMap[key].platformOps += fin.platformFee;
    });
    const revenueTrend = Object.values(trendMap);

    const categoryMap = {};
    bookings.forEach((booking) => {
      const name = booking.category || 'general';
      if (!categoryMap[name]) {
        categoryMap[name] = { name, count: 0, value: 0 };
      }
      categoryMap[name].count += 1;
      categoryMap[name].value += getBookingFinancials(booking).customerTotal;
    });
    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.count - a.count);

    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const customersThisMonth = await User.countDocuments({
      role: 'CUSTOMER',
      createdAt: { $gte: startThisMonth }
    });
    const customersLastMonth = await User.countDocuments({
      role: 'CUSTOMER',
      createdAt: { $gte: startLastMonth, $lt: startThisMonth }
    });
    const customerTrendPercent = customersLastMonth > 0
      ? Math.round(((customersThisMonth - customersLastMonth) / customersLastMonth) * 100)
      : (customersThisMonth > 0 ? 100 : 0);

    const recentBookings = bookings.slice(0, 8).map((b) => {
      const fin = getBookingFinancials(b);
      return {
        id: b.id,
        serviceTitle: b.serviceTitle,
        customerName: b.customerName,
        providerName: b.providerName,
        status: b.status,
        paymentStatus: b.paymentStatus || 'PENDING',
        date: b.date,
        time: b.time,
        createdAt: b.createdAt,
        customerTotal: fin.customerTotal,
        workerEarnings: fin.workerEarnings,
        platformFee: fin.platformFee,
        refundAmount: fin.refundAmount,
        cancellationDeduction: fin.cancellationDeduction
      };
    });

    const recentCustomers = (await User.find({ role: 'CUSTOMER' })
      .select('id name email location neighbourhood city state createdAt memberSince')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()).map((u) => ({
      id: u.id || u._id?.toString(),
      name: u.name,
      email: u.email,
      location: formatLocation(u),
      joinedDate: u.createdAt || u.memberSince
    }));

    const recentWorkers = providers
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id || p._id?.toString(),
        name: p.name,
        skill: p.skill,
        location: p.location,
        isAvailable: p.isAvailable,
        status: p.status || 'Active'
      }));

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalWorkers,
        activeProviders,
        onDutyWorkers,
        totalBookings,
        pendingBookings,
        activeBookings,
        todayBookings: activeBookings,
        completedServices,
        cancelledBookings,
        totalWorkerEarnings: totals.workerEarnings,
        platformRevenue: totals.platformRevenue,
        grossVolume: totals.gross,
        platformFeePercent: PLATFORM_FEE_PERCENT,
        providerUtilization,
        averageRating,
        reviewsCount: validReviews.length,
        cancellationRate: `${cancellationRateValue.toFixed(1)}%`,
        cancellationRateValue,
        geoReviewCount,
        customerTrendPercent,
        recentBookings,
        recentCustomers,
        recentWorkers,
        revenueTrend,
        categoryBreakdown
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminProviders = async (req, res) => {
  try {
    const [providersList, bookings, reviews] = await Promise.all([
      Provider.find({}).sort({ createdAt: -1 }).lean(),
      Booking.find({}).lean(),
      Review.find({ isSuspicious: false }).lean()
    ]);

    const bookingsByProvider = {};
    bookings.forEach((booking) => {
      const key = String(booking.providerId || '');
      if (!key) return;
      if (!bookingsByProvider[key]) bookingsByProvider[key] = [];
      bookingsByProvider[key].push(booking);
    });

    const reviewsByProvider = {};
    reviews.forEach((review) => {
      const key = String(review.providerId || '');
      if (!key) return;
      if (!reviewsByProvider[key]) reviewsByProvider[key] = [];
      reviewsByProvider[key].push(review);
    });

    const matchKeys = (provider) => [
      provider.id,
      provider._id?.toString(),
      provider.userId,
      provider.workerId
    ].filter(Boolean).map(String);

    const providers = providersList.map((p) => {
      const keys = matchKeys(p);
      const relatedBookings = keys.flatMap((k) => bookingsByProvider[k] || []);
      const uniqueBookings = Array.from(new Map(relatedBookings.map((b) => [b.id || b._id?.toString(), b])).values());
      const completed = uniqueBookings.filter(isCompletedForRevenue);
      const earnings = completed.reduce((sum, b) => sum + getBookingFinancials(b).workerEarnings, 0);
      const relatedReviews = keys.flatMap((k) => reviewsByProvider[k] || []);
      const validReviews = relatedReviews.filter((r) => typeof r.rating === 'number' && r.rating > 0);
      const rating = validReviews.length > 0
        ? parseFloat((validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(2))
        : (typeof p.rating === 'number' && p.rating > 0 ? p.rating : 0);

      return stripSensitive({
        id: p.id || p._id?.toString(),
        name: p.name,
        email: p.email,
        phone: p.phone,
        avatar: p.avatar,
        skill: p.skill,
        categories: p.categories || [],
        location: p.location,
        serviceAreas: p.serviceAreas || [],
        experienceYears: p.experienceYears,
        isVerified: Boolean(p.isVerified),
        isAvailable: p.isAvailable !== false,
        status: p.status || 'Active',
        trustScore: p.trustScore || 0,
        coopMemberId: p.coopMemberId,
        workerId: p.workerId,
        bio: p.bio,
        startingPrice: p.startingPrice,
        completedJobs: completed.length,
        totalNetEarnings: earnings,
        rating,
        reviewsCount: validReviews.length,
        deactivationReason: p.deactivationReason || null,
        createdAt: p.createdAt
      });
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
    const { status, isVerified, reason } = req.body;
    const requestedStatus = status === undefined ? undefined : String(status).trim();
    const normalizedStatus = requestedStatus === 'Inactive' || requestedStatus === 'INACTIVE' ? 'Suspended' : requestedStatus;

    const isDeactivationRequest = ['Suspended', 'SUSPENDED', 'Inactive', 'INACTIVE'].includes(String(normalizedStatus || ''));
    const isReactivationRequest = ['Active', 'ACTIVE'].includes(String(normalizedStatus || ''));

    if (isDeactivationRequest) {
      const trimmedReason = typeof reason === 'string' ? reason.trim() : '';

      if (!trimmedReason) {
        return res.status(400).json({
          success: false,
          message: 'Deactivation reason is required.'
        });
      }

      if (trimmedReason.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Deactivation reason must be 500 characters or fewer.'
        });
      }
    }

    const query = mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { id }] } : { id };
    const actingAdminId = req.user?.id || req.user?._id?.toString() || 'unknown-admin';

    const provider = await Provider.findOneAndUpdate(
      query,
      {
        $set: {
          ...(normalizedStatus !== undefined && { status: normalizedStatus }),
          ...(isVerified !== undefined && { isVerified: Boolean(isVerified) }),
          ...(isDeactivationRequest && {
            deactivationReason: typeof reason === 'string' ? reason.trim() : '',
            deactivatedAt: new Date(),
            deactivatedBy: actingAdminId
          }),
          ...(isReactivationRequest && {
            deactivationReason: null,
            deactivatedAt: null,
            deactivatedBy: null
          })
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
      provider: stripSensitive(provider.toObject ? provider.toObject() : provider)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminCustomers = async (req, res) => {
  try {
    const [dbUsers, bookings] = await Promise.all([
      User.find({ role: 'CUSTOMER' }).select('-password -resetPasswordToken -resetPasswordExpires -tokenVersion').sort({ createdAt: -1 }).lean(),
      Booking.find({}).select('customerId status').lean()
    ]);

    const bookingCounts = {};
    bookings.forEach((b) => {
      const key = String(b.customerId || '');
      if (!key) return;
      bookingCounts[key] = (bookingCounts[key] || 0) + 1;
    });

    const customers = dbUsers.map((u) => {
      const uId = u.id || u._id?.toString();
      const idKeys = [...new Set([uId, u.id, u._id?.toString()].filter(Boolean).map(String))];
      const totalBookings = idKeys.reduce((sum, key) => sum + (bookingCounts[key] || 0), 0);
      return {
        id: uId,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        location: formatLocation(u) || '',
        totalBookings,
        rewardPoints: u.rewardsPoints || 0,
        status: 'REGISTERED',
        joinedDate: u.createdAt || u.memberSince
      };
    });

    return res.status(200).json({
      success: true,
      customers,
      total: customers.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminBookings = async (req, res) => {
  try {
    const bookingsDocs = await Booking.find({}).sort({ createdAt: -1 }).lean();
    const bookings = bookingsDocs.map((b) => {
      const fin = getBookingFinancials(b);
      return stripSensitive({
        ...b,
        id: b.id || b._id?.toString(),
        pricing: {
          ...(b.pricing || {}),
          customerTotal: fin.customerTotal,
          workerEarnings: fin.workerEarnings,
          platformFee: fin.platformFee,
          platformOperations: fin.platformFee,
          refundAmount: fin.refundAmount,
          cancellationDeduction: fin.cancellationDeduction
        },
        refundAmount: fin.refundAmount,
        cancellationDeduction: fin.cancellationDeduction,
        paymentStatus: b.paymentStatus || 'PENDING'
      });
    });

    return res.status(200).json({
      success: true,
      bookings,
      total: bookings.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminMatchingInspection = async (req, res) => {
  try {
    const bookings = await Booking.find({
      status: { $in: ACTIVE_BOOKING_STATUSES }
    }).sort({ createdAt: -1 }).limit(10).lean();
    const providersDocs = await Provider.find({}).lean();
    const providers = providersDocs.map((p) => stripSensitive(p));

    const activeDispatches = bookings.map((b) => {
      const provider = providers.find((p) =>
        p.id === b.providerId ||
        p._id?.toString() === b.providerId ||
        p.userId === b.providerId ||
        p.workerId === b.providerId
      ) || null;

      const matchResult = providers.length > 0
        ? matchProviders(providers, {
          categoryId: b.category,
          serviceTitle: b.serviceTitle
        })
        : { rankedProviders: [], topMatch: null };

      const scoredProv = provider
        ? matchResult.rankedProviders?.find((p) =>
          p.id === provider.id || p._id?.toString() === provider._id?.toString()
        )
        : matchResult.topMatch;

      return {
        bookingId: b.id,
        serviceTitle: b.serviceTitle,
        category: b.category,
        customerName: b.customerName,
        assignedProvider: provider?.name || b.providerName || '',
        providerSkill: provider?.skill || b.providerSkill || '',
        matchScore: scoredProv?.matchScore ?? null,
        scoreBreakdown: scoredProv?.scoreBreakdown || null,
        reasons: scoredProv?.reasons || []
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
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
    const totalBookings = bookings.length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED');
    const rejected = bookings.filter((b) => b.status === 'REJECTED');
    const totalCancellations = cancelled.length + rejected.length;
    const customerCancellations = cancelled.length;
    const providerCancellations = rejected.length;

    const cancellationAfterAssignment = cancelled.filter((b) => {
      const created = new Date(b.createdAt).getTime();
      const cancelledAt = new Date(b.cancelledAt || b.updatedAt || 0).getTime();
      return Number.isFinite(created) && Number.isFinite(cancelledAt) && (cancelledAt - created) >= 10 * 60 * 1000;
    }).length;

    const rapidCancels = cancelled.filter((b) => {
      const created = new Date(b.createdAt).getTime();
      const cancelledAt = new Date(b.cancelledAt || b.updatedAt || 0).getTime();
      return Number.isFinite(created) && Number.isFinite(cancelledAt) && (cancelledAt - created) < 10 * 60 * 1000;
    }).length;

    const cancellationRate = totalBookings > 0
      ? `${((totalCancellations / totalBookings) * 100).toFixed(1)}%`
      : '0%';

    const visibleRiskSignals = [];
    if (rapidCancels > 0 && totalBookings > 0) {
      visibleRiskSignals.push({
        id: 'sig_rapid_cancel',
        pattern: 'rapid_cancel',
        severity: rapidCancels / totalBookings > 0.05 ? 'Moderate' : 'Low',
        affectedCount: rapidCancels,
        observationKey: 'admin_leakage_obs_rapid',
        systemReasonKey: 'admin_leakage_reason_rapid',
        recommendedInterventionKey: 'admin_leakage_action_rapid'
      });
    }

    const cancelledList = [...cancelled, ...rejected].slice(0, 25).map((b) => {
      const fin = getBookingFinancials(b);
      return {
        id: b.id,
        serviceTitle: b.serviceTitle,
        customerName: b.customerName,
        providerName: b.providerName,
        status: b.status,
        paymentStatus: b.paymentStatus,
        cancellationReason: b.cancellationReason || '',
        cancellationDeduction: fin.cancellationDeduction,
        refundAmount: fin.refundAmount,
        customerTotal: fin.customerTotal,
        cancelledAt: b.cancelledAt || b.updatedAt
      };
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalBookings,
        totalCancellations,
        cancellationRate,
        customerCancellations,
        providerCancellations,
        cancellationAfterAssignment,
        visibleRiskSignals,
        cancelledBookings: cancelledList,
        retentionPolicy: 'value_first'
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
    const providers = providersDocs.map((p) => (p.toObject ? p.toObject() : p));
    const bookings = bookingsDocs.map((b) => (b.toObject ? b.toObject() : b));

    const insights = generateAIDemandInsights(providers, bookings);
    return res.status(200).json(insights);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    const mongoFilter = {
      $or: [
        { userId },
        ...(mongoose.isValidObjectId(userId) ? [{ userId: String(userId) }] : []),
        { type: 'SYSTEM' }
      ]
    };

    const [dbNotifications, recentBookings] = await Promise.all([
      Notification.find(mongoFilter).sort({ createdAt: -1 }).limit(40).lean(),
      Booking.find({}).sort({ updatedAt: -1 }).limit(20).lean()
    ]);

    const stored = dbNotifications.map((n) => ({
      id: n.id || n._id?.toString(),
      title: n.title,
      message: n.message,
      type: n.type || 'SYSTEM',
      read: Boolean(n.read),
      createdAt: n.createdAt,
      source: 'notification'
    }));

    const activity = recentBookings.map((b) => ({
      id: `act_${b.id}_${b.status}`,
      titleKey: `admin_notif_event_${b.status}`,
      title: `${b.serviceTitle || 'Booking'} · ${b.status}`,
      message: `${b.customerName || ''} → ${b.providerName || ''} · ₹${getBookingFinancials(b).customerTotal}`,
      type: b.status,
      read: true,
      createdAt: b.updatedAt || b.createdAt,
      source: 'booking',
      bookingId: b.id
    }));

    const merged = [...stored, ...activity]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 40);

    return res.status(200).json({
      success: true,
      notifications: merged,
      unreadCount: merged.filter((n) => !n.read).length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markAdminNotificationsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id?.toString();
    await Notification.updateMany(
      {
        $or: [
          { userId },
          ...(mongoose.isValidObjectId(userId) ? [{ userId: String(userId) }] : [])
        ],
        read: false
      },
      { $set: { read: true } }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      settings: {
        platformFeePercent: PLATFORM_FEE_PERCENT,
        workerSharePercent: 100 - PLATFORM_FEE_PERCENT,
        cancellationChargePercent: 10,
        upfrontPercent: 25,
        editable: false
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
