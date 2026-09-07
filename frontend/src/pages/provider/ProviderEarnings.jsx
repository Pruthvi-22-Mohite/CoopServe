import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
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
  Download
} from 'lucide-react';

export const ProviderEarnings = () => {
  const { t } = useLanguage();
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
    return <LoadingState message={t('worker_loading_earnings', 'Calculating transparent worker earnings ledger...')} />;
  }

  const {
    grossPayments = 0,
    workerNetEarnings = 0,
    platformOps = 0,
    availablePayout = 0,
    pendingPayout = 0,
    breakdownList = []
  } = earningsData || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('worker_earnings_page_title', 'Worker Earnings & Transparent Payouts')}
        description={t(
          'worker_earnings_page_desc',
          'CoopServe guarantees 90% direct worker compensation with zero hidden commissions and automatic bank settlement.'
        )}
        breadcrumbs={[t('nav_dashboard', 'Home'), t('worker_menu_earnings', 'Earnings')]}
        badge={
          <Badge variant="success" size="sm">
            {t('worker_net_worker_rate', '90% Net Worker Rate')}
          </Badge>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('worker_takehome_net_stat', 'Net Take-Home Earnings (90%)')}
          value={`₹${workerNetEarnings.toLocaleString()}`}
          icon={IndianRupee}
          trend={{ direction: 'up', text: t('worker_direct_bank_hint', 'Direct to your bank account') }}
          variant="success"
        />
        <StatCard
          title={t('worker_gross_payments_stat', 'Gross Customer Payments')}
          value={`₹${grossPayments.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ direction: 'up', text: t('worker_total_val_generated', 'Total value generated') }}
          variant="primary"
        />
        <StatCard
          title={t('worker_platform_ops_stat', 'Platform Operations (10%)')}
          value={`₹${platformOps.toLocaleString()}`}
          icon={ShieldCheck}
          trend={{ direction: 'up', text: t('worker_platform_ops_hint', 'Protection, App & AI matching') }}
          variant="info"
        />
        <StatCard
          title={t('worker_available_payout_stat', 'Available Payout')}
          value={`₹${availablePayout.toLocaleString()}`}
          icon={HeartHandshake}
          trend={{ direction: 'up', text: `${pendingPayout.toLocaleString()} ${t('worker_pending_payout_hint', 'pending payout')}` }}
          variant="warning"
        />
      </div>

      {/* Transparent Model Comparison Banner */}
      <Card className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <Badge variant="protected" size="sm">
              {t('worker_badge_protected', 'Cooperative Equity Model')}
            </Badge>
            <h3 className="text-xl font-black text-white">
              {t('worker_equity_model_title', 'How Every Rupee Is Distributed')}
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              {t(
                'worker_equity_model_desc',
                'Unlike traditional corporate gig platforms that take 25% to 35% commission, CoopServe operates on a fair cooperative principle where 90% goes directly to you and 10% supports secure payment processing, dispute resolution, and continuous matching.'
              )}
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-3xl font-black text-emerald-300">90%</span>
            <span className="text-xs uppercase font-bold text-white block mt-0.5">
              {t('worker_takehome_net_stat', 'Worker Payout')}
            </span>
          </div>
        </div>
      </Card>

      {/* Bank Account Settlement Card */}
      <Card className="p-5 border border-slate-200/90 shadow-soft bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-700">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">{t('worker_payout_summary_title', 'Payout summary')}</h4>
              <p className="text-xs text-slate-500">
                {t('worker_payout_summary_sub', 'Available: ₹{avail} • Pending: ₹{pending}')
                  .replace('{avail}', availablePayout.toLocaleString())
                  .replace('{pending}', pendingPayout.toLocaleString())}
              </p>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                {t('worker_payout_calculated_note', '✓ Calculated from completed booking and payment records')}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            {t('worker_download_statement', 'Download Payout Statement')}
          </Button>
        </div>
      </Card>

      {/* Detailed Transaction Breakdown Ledger */}
      <Card className="p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            {t('worker_per_job_breakdown_title', 'Per-Job Earnings Breakdown')}
          </h3>
          <span className="text-xs text-slate-400">
            {t('worker_all_bookings_registered', 'All bookings registered on CoopServe')}
          </span>
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

              <div className="flex items-center gap-4 text-right flex-wrap">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('worker_customer_label', 'Customer')} Paid</span>
                  <span className="font-semibold text-slate-700">₹{row.customerPaid}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block text-[10px]">{t('worker_your_net_payout_label', 'Worker Net (90%)')}</span>
                  <span className="font-black text-emerald-800 text-sm">₹{row.netEarnings}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[10px]">{t('worker_platform_ops_stat', 'Platform (10%)')}</span>
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
