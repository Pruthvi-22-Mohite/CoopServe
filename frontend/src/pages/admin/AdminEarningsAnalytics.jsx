import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import {
  IndianRupee,
  ShieldCheck,
  HeartHandshake,
  TrendingUp,
  Download,
  PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminEarningsAnalytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminDashboard();
        if (res.success && res.stats) {
          setData(res.stats);
        }
      } catch (err) {
        console.error('Error fetching admin earnings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading cooperative revenue distribution analytics..." />;
  }

  const {
    totalWorkerEarnings = 558000,
    platformRevenue = 62000,
    revenueTrend = []
  } = data || {};

  const totalGross = Math.round(totalWorkerEarnings / 0.90);
  const platformOps = platformRevenue || Math.round(totalGross * 0.10);

  const pieData = [
    { name: 'Worker Take-Home (90%)', value: 90, color: '#059669' },
    { name: 'Platform Operations & Support (10%)', value: 10, color: '#475569' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ecosystem Financial Analytics & Fee Distribution"
        description="Comprehensive audit of customer transaction volumes, 90% direct worker payouts, and 10% platform operations and dispute protection."
        breadcrumbs={['Home', 'Admin', 'Earnings Analytics']}
        badge={
          <Badge variant="success" size="sm">
            90 / 10 Transparent Split
          </Badge>
        }
      />

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Volume"
          value={`₹${(totalGross / 100000).toFixed(2)} Lakhs`}
          icon={TrendingUp}
          trend={{ direction: 'up', text: 'All bookings on CoopServe' }}
          variant="primary"
        />
        <StatCard
          title="Worker Net Earnings (90%)"
          value={`₹${(totalWorkerEarnings / 100000).toFixed(2)} Lakhs`}
          icon={IndianRupee}
          trend={{ direction: 'up', text: '90% direct to worker bank' }}
          variant="success"
        />
        <StatCard
          title="Platform Operations (10%)"
          value={`₹${(platformOps / 1000).toFixed(0)}k`}
          icon={ShieldCheck}
          trend={{ direction: 'up', text: 'Protection, servers & support' }}
          variant="info"
        />
        <StatCard
          title="Worker Net Rate"
          value="90.0%"
          icon={HeartHandshake}
          trend={{ direction: 'up', text: 'Zero hidden commissions' }}
          variant="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stacked Monthly Bar Chart (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Monthly Payout Breakdown (Past 6 Months)</h3>
                <p className="text-xs text-slate-500">Worker take-home earnings vs platform operations and protection</p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(val) => [`₹${val.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="workerEarnings" name="Worker Payout (90%)" fill="#059669" stackId="a" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="platformOps" name="Platform Operations (10%)" fill="#64748b" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 90/10 Distribution Donut (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Fixed Split Ratio</h3>
              <p className="text-xs text-slate-500">Transparent fair-share policy</p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, 'Split']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-slate-900 font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
