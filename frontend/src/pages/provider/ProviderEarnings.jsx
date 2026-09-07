import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import {
  IndianRupee,
  ShieldCheck,
  Building,
  HeartHandshake,
  TrendingUp,
  Download,
  ArrowUpRight,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const ProviderEarnings = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      setIsLoading(true);
      try {
        const res = await api.getProviderEarnings();
        if (res.success) {
          setEarningsData(res.earnings);
        }
      } catch (err) {
        console.error('Error fetching provider earnings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (isLoading) {
    return <LoadingState message="Calculating transparent worker earnings ledger..." />;
  }

  const {
    grossPayments = 0,
    workerNetEarnings = 0,
    platformOps = 0,
    availablePayout = 0,
    pendingPayout = 0,
    payoutAccount = {},
    breakdownList = []
  } = earningsData || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker Earnings & Transparent Payouts"
        description="CoopServe guarantees 90% direct worker compensation with zero hidden commissions and automatic bank settlement."
        breadcrumbs={['Home', 'Earnings']}
        badge={
          <Badge variant="success" size="sm">
            90% Net Worker Rate
          </Badge>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Take-Home Earnings (90%)"
          value={`₹${workerNetEarnings.toLocaleString()}`}
          icon={IndianRupee}
          trend={{ direction: 'up', text: 'Direct to your bank account' }}
          variant="success"
        />
        <StatCard
          title="Gross Customer Payments"
          value={`₹${grossPayments.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ direction: 'up', text: 'Total value generated' }}
          variant="primary"
        />
        <StatCard
          title="Platform Operations (10%)"
          value={`₹${platformOps.toLocaleString()}`}
          icon={ShieldCheck}
          trend={{ direction: 'up', text: 'Protection, App & AI matching' }}
          variant="info"
        />
        <StatCard
          title="Available Payout"
          value={`₹${availablePayout.toLocaleString()}`}
          icon={HeartHandshake}
          trend={{ direction: 'up', text: `${pendingPayout.toLocaleString()} pending payout` }}
          variant="warning"
        />
      </div>

      {/* Transparent Model Comparison Banner */}
      <Card className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <Badge variant="protected" size="sm">Cooperative Equity Model</Badge>
            <h3 className="text-xl font-black text-white">How Every Rupee Is Distributed</h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Unlike traditional corporate gig platforms that take 25% to 35% commission, CoopServe operates on a fair cooperative principle where 90% goes directly to you and 10% supports secure payment processing, dispute resolution, and continuous matching.
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-3xl font-black text-emerald-300">90%</span>
            <span className="text-xs uppercase font-bold text-white block mt-0.5">Worker Payout</span>
          </div>
        </div>
      </Card>

      {/* Bank Account Settlement Card */}
      <Card className="p-5 border border-slate-200/90 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">Payout summary</h4>
              <p className="text-xs text-slate-500">Available: ₹{availablePayout.toLocaleString()} • Pending: ₹{pendingPayout.toLocaleString()}</p>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                ✓ Calculated from completed booking and payment records
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download Payout Statement
          </Button>
        </div>
      </Card>

      {/* Detailed Transaction Breakdown Ledger */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Per-Job Earnings Breakdown</h3>
          <span className="text-xs text-slate-400">All bookings registered on CoopServe</span>
        </div>

        <div className="space-y-2.5">
          {breakdownList.map((row, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{row.service}</span>
                  <span className="text-[10px] text-slate-400">ID: {row.bookingId}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Date: {row.date} {row.travelFee > 0 ? `• Base ₹${row.basePrice || 400} + ₹${row.travelFee} Travel (${row.distanceKm} km)` : ''}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-slate-400 block text-[10px]">Customer Paid</span>
                  <span className="font-semibold text-slate-700">₹{row.customerPaid}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block text-[10px]">Worker Net (90%)</span>
                  <span className="font-black text-emerald-800 text-sm">₹{row.netEarnings}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[10px]">Platform (10%)</span>
                  <span className="font-semibold text-slate-700">₹{row.platformOps}</span>
                </div>
                <div>
                  <Badge variant={row.status === 'AVAILABLE' ? 'success' : row.status === 'CANCELLED' || row.status === 'PAYMENT_FAILED' ? 'danger' : 'protected'} size="sm">
                    {row.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
