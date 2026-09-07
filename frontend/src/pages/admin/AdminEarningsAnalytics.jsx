import React, { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAdminLiveRefresh } from '../../hooks/useAdminLiveRefresh';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { IndianRupee, ShieldCheck, HeartHandshake, TrendingUp } from 'lucide-react';
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

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const AdminEarningsAnalytics = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await api.getAdminDashboard();
      if (res.success && res.stats) {
        setData(res.stats);
        setError('');
      } else {
        setError(res.message || t('admin_error_load'));
      }
    } catch (err) {
      setError(err.message || t('admin_error_load'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useAdminLiveRefresh(fetchEarnings);

  if (isLoading) {
    return <LoadingState message={t('admin_earnings_loading')} />;
  }

  if (error && !data) {
    return <EmptyState title={t('admin_error_title')} description={error} />;
  }

  const {
    totalWorkerEarnings = 0,
    platformRevenue = 0,
    grossVolume = 0,
    platformFeePercent = 10,
    revenueTrend = []
  } = data || {};

  const totalGross = grossVolume || (totalWorkerEarnings + platformRevenue);
  const workerShare = 100 - platformFeePercent;
  const pieData = [
    { name: t('admin_chart_worker_series'), value: workerShare, color: '#059669' },
    { name: t('admin_chart_platform_series'), value: platformFeePercent, color: '#475569' }
  ];
  const hasTrend = revenueTrend.some((row) => (row.workerEarnings || 0) + (row.platformOps || 0) > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_earnings_title')}
        description={t('admin_earnings_desc')}
        breadcrumbs={[t('nav_home'), t('role_admin_portal'), t('admin_nav_earnings')]}
        badge={<Badge variant="success" size="sm">{t('admin_earnings_badge')}</Badge>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('admin_earnings_stat_gross')} value={formatInr(totalGross)} icon={TrendingUp} variant="primary" />
        <StatCard title={t('admin_earnings_stat_worker')} value={formatInr(totalWorkerEarnings)} icon={IndianRupee} variant="success" />
        <StatCard title={t('admin_earnings_stat_platform')} value={formatInr(platformRevenue)} icon={ShieldCheck} variant="info" />
        <StatCard title={t('admin_earnings_stat_commission')} value={`${Number(platformFeePercent).toFixed(1)}%`} icon={HeartHandshake} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t('admin_earnings_monthly_title')}</h3>
              <p className="text-xs text-slate-500">{t('admin_earnings_monthly_desc')}</p>
            </div>
            <div className="h-72 w-full pt-2">
              {hasTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val) => [formatInr(val), '']} />
                    <Legend />
                    <Bar dataKey="workerEarnings" name={t('admin_chart_worker_series')} fill="#059669" stackId="a" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="platformOps" name={t('admin_chart_platform_series')} fill="#64748b" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title={t('admin_empty_revenue')} description={t('admin_empty_revenue_desc')} className="h-full bg-transparent border-0" />
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t('admin_earnings_pie_title')}</h3>
              <p className="text-xs text-slate-500">{t('admin_earnings_pie_desc')}</p>
            </div>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, t('admin_split_label')]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between font-semibold">
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
