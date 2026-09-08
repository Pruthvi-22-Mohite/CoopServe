import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAdminLiveRefresh } from '../../hooks/useAdminLiveRefresh';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  IndianRupee,
  Star,
  XCircle,
  TrendingUp,
  Cpu,
  ArrowRight,
  AlertTriangle,
  Clock
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

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = useCallback(async () => {
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

  useAdminLiveRefresh(fetchAdminData);

  if (isLoading) {
    return <LoadingState message={t('admin_loading_dashboard')} />;
  }

  if (error && !data) {
    return <EmptyState title={t('admin_error_title')} description={error} />;
  }

  const {
    totalCustomers = 0,
    totalWorkers = 0,
    onDutyWorkers = 0,
    totalBookings = 0,
    pendingBookings = 0,
    activeBookings = 0,
    completedServices = 0,
    cancelledBookings = 0,
    totalWorkerEarnings = 0,
    platformRevenue = 0,
    averageRating = 0,
    cancellationRate = '0%',
    geoReviewCount = 0,
    customerTrendPercent = 0,
    revenueTrend = [],
    categoryBreakdown = [],
    recentBookings = [],
    recentCustomers = [],
    recentWorkers = []
  } = data || {};

  const statusLabel = (status) => t(`admin_status_${String(status || '').toLowerCase()}`, status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_dash_title')}
        description={t('admin_dash_desc')}
        breadcrumbs={[t('nav_home'), t('role_admin_portal')]}
        badge={
          <Badge variant="protected" size="sm">
            {t('admin_dash_badge')}
          </Badge>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('admin_stat_customers')}
          value={totalCustomers.toLocaleString()}
          icon={Users}
          trend={{ direction: customerTrendPercent >= 0 ? 'up' : 'down', text: `${customerTrendPercent}% ${t('admin_trend_this_month')}` }}
          variant="primary"
        />
        <StatCard
          title={t('admin_stat_workers')}
          value={totalWorkers}
          icon={ShieldCheck}
          trend={{ direction: 'up', text: t('admin_trend_registered_workers') }}
          variant="success"
        />
        <StatCard
          title={t('admin_stat_on_duty')}
          value={onDutyWorkers}
          icon={Clock}
          trend={{ direction: 'up', text: t('admin_trend_live_slots') }}
          variant="info"
        />
        <StatCard
          title={t('admin_stat_total_bookings')}
          value={totalBookings.toLocaleString()}
          icon={CalendarCheck}
          trend={{ direction: 'up', text: t('admin_trend_all_records') }}
          variant="primary"
        />
        <StatCard
          title={t('admin_stat_pending')}
          value={pendingBookings}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title={t('admin_stat_active_bookings')}
          value={activeBookings}
          icon={CalendarCheck}
          variant="info"
        />
        <StatCard
          title={t('admin_stat_completed')}
          value={completedServices.toLocaleString()}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title={t('admin_stat_cancelled')}
          value={cancelledBookings}
          icon={XCircle}
          variant="danger"
        />
        <StatCard
          title={t('admin_stat_worker_earnings')}
          value={formatInr(totalWorkerEarnings)}
          icon={IndianRupee}
          trend={{ direction: 'up', text: t('admin_trend_no_hidden') }}
          variant="success"
        />
        <StatCard
          title={t('admin_stat_platform_rev')}
          value={formatInr(platformRevenue)}
          icon={TrendingUp}
          trend={{ direction: 'up', text: t('admin_trend_ops_cover') }}
          variant="info"
        />
        <StatCard
          title={t('admin_stat_avg_rating')}
          value={averageRating > 0 ? `${averageRating}` : t('admin_value_na')}
          icon={Star}
          variant="primary"
        />
        <StatCard
          title={t('admin_stat_cancel_rate')}
          value={cancellationRate}
          icon={AlertTriangle}
          trend={{ direction: geoReviewCount > 0 ? 'down' : 'up', text: geoReviewCount > 0 ? t('admin_trend_geo_review') : t('admin_trend_geo_ok') }}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">{t('admin_chart_gross_title')}</h3>
                <p className="text-xs text-slate-500">{t('admin_chart_gross_desc')}</p>
              </div>
              <Badge variant="coop" size="sm">{t('admin_chart_badge')}</Badge>
            </div>

            <div className="h-72 w-full pt-2">
              {revenueTrend.some((row) => row.gross > 0 || row.workerEarnings > 0) ? (
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
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val) => [formatInr(val), '']} />
                    <Legend />
                    <Area type="monotone" dataKey="gross" name={t('admin_chart_gross_series')} stroke="#047857" fillOpacity={1} fill="url(#grossGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="workerEarnings" name={t('admin_chart_worker_series')} stroke="#0f766e" fillOpacity={1} fill="url(#workerGrad)" strokeWidth={2} />
                  </AreaChart>
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
              <h3 className="font-bold text-base text-slate-900">{t('admin_chart_category_title')}</h3>
              <p className="text-xs text-slate-500">{t('admin_chart_category_desc')}</p>
            </div>

            <div className="h-72 w-full pt-2">
              {categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={90} />
                    <Tooltip formatter={(val) => [`${val} ${t('admin_jobs_label')}`, t('admin_volume_label')]} />
                    <Bar dataKey="count" name={t('admin_jobs_label')} fill="#059669" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState title={t('admin_empty_category')} className="h-full bg-transparent border-0" />
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">{t('admin_recent_bookings')}</h3>
          {recentBookings.length === 0 ? (
            <EmptyState title={t('admin_bookings_empty')} className="py-6" />
          ) : (
            <div className="space-y-2">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{booking.serviceTitle}</p>
                    <p className="text-[10px] text-slate-500">{booking.customerName} · {booking.providerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">{formatInr(booking.customerTotal)}</p>
                    <Badge variant="protected" size="sm">{statusLabel(booking.status)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">{t('admin_recent_customers')}</h3>
            {recentCustomers.length === 0 ? (
              <EmptyState title={t('admin_customers_empty')} className="py-6" />
            ) : (
              recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{customer.name}</span>
                  <span className="text-slate-500">{customer.location || t('profile_location_unset')}</span>
                </div>
              ))
            )}
          </Card>
          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">{t('admin_recent_workers')}</h3>
            {recentWorkers.length === 0 ? (
              <EmptyState title={t('admin_providers_empty')} className="py-6" />
            ) : (
              recentWorkers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{worker.name}</span>
                  <span className="text-slate-500">{worker.skill} · {worker.isAvailable ? t('admin_on_duty') : t('admin_off_duty')}</span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverable onClick={() => navigate('/admin/providers')} className="p-4 bg-white border border-slate-200 cursor-pointer space-y-2 group">
          <div className="flex items-center justify-between">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('admin_nav_providers')}</h4>
          <p className="text-xs text-slate-500">{t('admin_nav_providers_desc')}</p>
        </Card>
        <Card hoverable onClick={() => navigate('/admin/matching')} className="p-4 bg-white border border-slate-200 cursor-pointer space-y-2 group">
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('admin_nav_matching')}</h4>
          <p className="text-xs text-slate-500">{t('admin_nav_matching_desc')}</p>
        </Card>
        <Card hoverable onClick={() => navigate('/admin/bookings')} className="p-4 bg-white border border-slate-200 cursor-pointer space-y-2 group">
          <div className="flex items-center justify-between">
            <CalendarCheck className="w-5 h-5 text-teal-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('admin_nav_bookings')}</h4>
          <p className="text-xs text-slate-500">{t('admin_nav_bookings_desc')}</p>
        </Card>
        <Card hoverable onClick={() => navigate('/admin/leakage-risk')} className="p-4 bg-white border border-slate-200 cursor-pointer space-y-2 group">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('admin_nav_leakage')}</h4>
          <p className="text-xs text-slate-500">{t('admin_nav_leakage_desc')}</p>
        </Card>
      </div>
    </div>
  );
};
