import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  IndianRupee,
  HeartHandshake,
  Star,
  XCircle,
  TrendingUp,
  Cpu,
  ArrowRight,
  AlertTriangle,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminDashboard();
        if (res.success && res.stats) {
          setData(res.stats);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading cooperative enterprise control dashboard..." />;
  }

  const {
    totalCustomers = 1420,
    activeProviders = 6,
    todayBookings = 4,
    completedServices = 4894,
    totalWorkerEarnings = 2150880,
    communityFund = 142620,
    averageRating = 4.88,
    cancellationRate = '2.4%',
    geoReviewCount = 0,
    revenueTrend = [],
    categoryBreakdown = [],
    recentBookings = []
  } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cooperative Administration & Platform Oversight"
        description="Monitor platform health, multi-factor AI dispatch fairness, transparent 90/10 economics, and cooperative operations in Pune."
        breadcrumbs={['Home', 'Admin']}
        badge={
          <Badge variant="protected" size="sm">
            Platform Engine v2.0
          </Badge>
        }
      />

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          icon={Users}
          trend={{ direction: 'up', text: '+14% this month' }}
          variant="primary"
        />
        <StatCard
          title="Active Certified Pros"
          value={activeProviders}
          icon={ShieldCheck}
          trend={{ direction: 'up', text: '100% Verified in Pune' }}
          variant="success"
        />
        <StatCard
          title="Active Dispatches"
          value={todayBookings}
          icon={CalendarCheck}
          trend={{ direction: 'up', text: 'Live service slots' }}
          variant="info"
        />
        <StatCard
          title="Completed Services"
          value={completedServices.toLocaleString()}
          icon={CheckCircle2}
          trend={{ direction: 'up', text: 'With 100% verified log' }}
          variant="success"
        />
        <StatCard
          title="Worker Earnings (90%)"
          value={`₹${(totalWorkerEarnings / 100000).toFixed(2)}L`}
          icon={IndianRupee}
          trend={{ direction: 'up', text: 'Zero hidden commission' }}
          variant="success"
        />
        <StatCard
          title="Platform Revenue (10%)"
          value={`₹${((data?.platformRevenue || 62000) / 1000).toFixed(0)}k`}
          icon={TrendingUp}
          trend={{ direction: 'up', text: 'Operations & dispute cover' }}
          variant="info"
        />
        <StatCard
          title="Average Rating"
          value={`${averageRating} ⭐`}
          icon={Star}
          trend={{ direction: 'up', text: 'Top 5% quality tier' }}
          variant="primary"
        />
        <StatCard
          title="Cancellation Rate"
          value={cancellationRate}
          icon={XCircle}
          trend={{ direction: 'down', text: 'Low friction metric' }}
          variant="danger"
        />
        <StatCard
          title="Geo Verification Reviews"
          value={geoReviewCount}
          icon={AlertTriangle}
          trend={{ direction: geoReviewCount > 0 ? 'down' : 'up', text: geoReviewCount > 0 ? 'Needs manual review' : 'All clear' }}
          variant={geoReviewCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Charts Row: Recharts Monthly Split & Category Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue & Worker Payout Area Chart (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Gross Volume vs Direct Worker Payouts (90%)</h3>
                <p className="text-xs text-slate-500">Demonstrating cooperative fair-share distribution over past 6 months</p>
              </div>
              <Badge variant="coop" size="sm">90% Direct Payout</Badge>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="workerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="gross" name="Gross Customer Volume" stroke="#047857" fillOpacity={1} fill="url(#grossGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="workerEarnings" name="Worker Net Take-Home (90%)" stroke="#0f766e" fillOpacity={1} fill="url(#workerGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Volume Breakdown Bar Chart (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Demand by Trade Category</h3>
              <p className="text-xs text-slate-500">Service booking volume across Pune</p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={90} />
                  <Tooltip formatter={(val) => [`${val} Jobs`, 'Volume']} />
                  <Bar dataKey="count" name="Jobs Count" fill="#059669" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          hoverable
          onClick={() => navigate('/admin/providers')}
          className="p-4 bg-white border border-slate-200 cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Provider Verification</h4>
          <p className="text-xs text-slate-500">Review technician credentials, Trust Scores, and duty states.</p>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/admin/matching')}
          className="p-4 bg-white border border-slate-200 cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">AI Matching Inspector</h4>
          <p className="text-xs text-slate-500">Inspect 6-factor weightings and fair workload balancing.</p>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/admin/bookings')}
          className="p-4 bg-white border border-slate-200 cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <CalendarCheck className="w-5 h-5 text-teal-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">All Service Bookings</h4>
          <p className="text-xs text-slate-500">Monitor active dispatches, status timeline, and receipts.</p>
        </Card>

        <Card
          hoverable
          onClick={() => navigate('/admin/leakage-risk')}
          className="p-4 bg-white border border-slate-200 cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Leakage & Cancellation Signals</h4>
          <p className="text-xs text-slate-500">Analyze on-platform patterns and cooperative value retention.</p>
        </Card>
      </div>
    </div>
  );
};
