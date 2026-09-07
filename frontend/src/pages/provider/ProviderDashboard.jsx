import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ChatModal } from '../../components/common/ChatModal';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  IndianRupee,
  Star,
  Award,
  ShieldCheck,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Truck,
  PlayCircle,
  TrendingUp,
  HeartHandshake,
  DollarSign,
  MessageSquare
} from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.getProviderStats(),
        api.getBookings()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
    } catch (err) {
      console.error('Error loading provider dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await api.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        showToast(`Job status updated to ${newStatus.replace('_', ' ')}!`, 'success');
        await fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update job status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading worker dashboard & job dispatches..." />;
  }

  const pendingRequests = bookings.filter((b) => b.status === 'BOOKED');
  const activeJobs = bookings.filter((b) =>
    ['PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)
  );
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  const providerInfo = stats?.provider || {};

  const metrics = stats?.metrics || {
    todayJobsCount: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
    rating: 0,
    trustScore: 0
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={providerInfo.avatar}
            name={providerInfo.name}
            size="xl"
            isVerified={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                COOP-MEMBER PORTAL
              </span>
              <Badge variant={providerInfo.isAvailable ? 'success' : 'warning'} size="sm">{providerInfo.isAvailable ? 'Active On Duty' : 'Off Duty'}</Badge>
            </div>
            <h2 className="text-2xl font-black text-white mt-0.5">{providerInfo.name}</h2>
            <p className="text-xs text-emerald-200">{providerInfo.skill} • ID: {providerInfo.workerId || providerInfo.id || '—'}</p>
          </div>
        </div>

        {/* Trust Score & Cooperative Badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex flex-col items-center justify-center font-black shadow-md">
            <span className="text-base leading-none text-white">{metrics.trustScore}</span>
            <span className="text-[8px] text-indigo-200">/100</span>
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase">CoopServe Trust Score</p>
            <p className="text-[11px] text-emerald-300 font-medium">90% Direct Net Payout Active</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Jobs"
          value={activeJobs.length + pendingRequests.length}
          icon={Briefcase}
          trend={{ direction: 'up', text: `${pendingRequests.length} Pending requests` }}
          variant="primary"
        />
        <StatCard
          title="Today's Net Earnings"
          value={`₹${metrics.todayEarnings.toLocaleString()}`}
          icon={IndianRupee}
          trend={{ direction: 'up', text: '90% direct worker split' }}
          variant="success"
        />
        <StatCard
          title="Monthly Income"
          value={`₹${metrics.monthlyEarnings.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ direction: 'up', text: 'Zero hidden commission' }}
          variant="info"
        />
        <StatCard
          title="Cooperative Standing"
          value="Certified Pro"
          icon={ShieldCheck}
          trend={{ direction: 'up', text: 'Active Member in Good Standing' }}
          variant="warning"
        />
      </div>

      {/* SECTION 1: INCOMING PENDING JOB REQUESTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>Incoming Job Requests ({pendingRequests.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Live service dispatches in Pune</span>
        </div>

        {pendingRequests.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500 bg-slate-50 border-dashed">
            No pending requests at this moment. You are ready for incoming dispatches!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="p-5 border-2 border-amber-400 bg-gradient-to-br from-amber-50/40 to-white space-y-3.5 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">NEW REQUEST</Badge>
                    <span className="text-xs font-bold text-slate-400">ID: {req.id}</span>
                  </div>
                  <span className="text-sm font-black text-emerald-800">
                    Net: ₹{req.pricing?.workerEarnings ?? 0}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{req.serviceTitle}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Customer: <strong className="text-slate-900">{req.customerName}</strong> • {req.customerPhone}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Slot: <strong>{req.date} at {req.time}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="line-clamp-1">Location: {req.address}</span>
                  </div>
                  {req.notes && (
                    <div className="pt-1 text-[11px] text-slate-500 italic">
                      Note: "{req.notes}"
                    </div>
                  )}
                </div>

                {/* Transparent Pre-Acceptance Earnings Breakdown */}
                <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Transparent Earnings Breakdown</span>
                    <span className="text-emerald-700 font-bold">100% Guaranteed</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Customer Payment:</span>
                    <span className="font-semibold text-slate-900">₹{req.pricing?.customerTotal ?? req.price ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Distance & Travel Fee ({req.pricing?.distanceKm ?? 0} km):</span>
                    <span className="font-semibold text-teal-800">+₹{req.pricing?.travelFee ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Operations Fee (10%):</span>
                    <span className="font-semibold text-slate-700">-₹{req.pricing?.platformFee ?? req.pricing?.platformOperations ?? 0}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-black text-xs">
                    <span className="text-emerald-900">Your Expected Net Earnings:</span>
                    <span className="text-emerald-700 text-sm">₹{req.pricing?.workerEarnings ?? 0}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic pt-0.5">Clear pricing before booking. Clear earnings before accepting.</p>
                </div>

                <div className="flex items-center justify-between pt-1 gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-1/2"
                    isLoading={updatingId === req.id}
                    onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-1/2 shadow-md"
                    isLoading={updatingId === req.id}
                    onClick={() => handleUpdateStatus(req.id, 'PROVIDER_ACCEPTED')}
                    rightIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Accept Job (₹{req.pricing?.workerEarnings ?? 0})
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE JOBS IN PROGRESS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Active Dispatches & Ongoing Jobs ({activeJobs.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Update status to notify customer in real-time</span>
        </div>

        {activeJobs.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-500 bg-slate-50">
            No active jobs in progress right now. Accepted jobs will appear here.
          </Card>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <Card key={job.id} className="p-5 border border-emerald-300 bg-white shadow-soft">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">ID: {job.id}</span>
                      <Badge variant="protected" size="sm">
                        {job.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="coop" size="sm">
                        90% Worker Net: ₹{job.pricing?.workerEarnings ?? 0}
                      </Badge>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900">{job.serviceTitle}</h4>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold">
                        Customer: {job.customerName} ({job.customerPhone})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {job.date} at {job.time}
                      </span>
                    </div>
                  </div>

                  {/* Status Progression Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveChatBooking(job)}
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    >
                      Chat
                    </Button>

                    {job.status === 'PROVIDER_ACCEPTED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={updatingId === job.id}
                        onClick={() => handleUpdateStatus(job.id, 'ON_THE_WAY')}
                        leftIcon={<Truck className="w-4 h-4" />}
                      >
                        Mark On The Way
                      </Button>
                    )}

                    {job.status === 'ON_THE_WAY' && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={updatingId === job.id}
                        onClick={() => handleUpdateStatus(job.id, 'ARRIVED')}
                        leftIcon={<MapPin className="w-4 h-4" />}
                      >
                        Mark Arrived at Site
                      </Button>
                    )}

                    {job.status === 'ARRIVED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={updatingId === job.id}
                        onClick={() => handleUpdateStatus(job.id, 'IN_PROGRESS')}
                        leftIcon={<PlayCircle className="w-4 h-4" />}
                      >
                        Start Service
                      </Button>
                    )}

                    {job.status === 'IN_PROGRESS' && (
                      <Button
                        variant="coop"
                        size="sm"
                        isLoading={updatingId === job.id}
                        onClick={() => handleUpdateStatus(job.id, 'COMPLETED')}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Complete Service & Get Paid (₹{job.pricing?.workerEarnings ?? 0})
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: RECENT COMPLETED VERIFIED JOBS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Recent Verified Work History ({completedJobs.length})
          </h3>
          <button
            onClick={() => navigate('/provider/history')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            View Full Verified Record <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {completedJobs.slice(0, 4).map((cJob) => (
            <div key={cJob.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{cJob.serviceTitle}</span>
                  <Badge variant="success" size="sm">✓ Verified</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Customer: {cJob.customerName} • {cJob.date}
                </p>
              </div>
              <div className="text-right">
                <span className="font-black text-emerald-800 text-sm">
                  +₹{cJob.pricing?.workerEarnings ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 block">90% Net Payout</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live In-App Chat Modal */}
      <ChatModal
        isOpen={!!activeChatBooking}
        onClose={() => setActiveChatBooking(null)}
        booking={activeChatBooking}
      />
    </div>
  );
};
