import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShieldCheck,
  Star,
  Calendar,
  Clock
} from 'lucide-react';

export const ProviderWorkHistory = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [bookRes, statsRes] = await Promise.all([
          api.getBookings(),
          api.getProviderStats()
        ]);
        if (bookRes.success) setBookings(bookRes.bookings || []);
        if (statsRes.success) setStats(statsRes.stats);
      } catch (err) {
        console.error('Error fetching work history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState message={t('worker_loading_work_history', 'Loading verified work records and portable credentials from MongoDB...')} />;
  }

  // Requirement 4: Cancelled, failed, or refunded bookings are strictly NOT completed work
  const completedBookings = (bookings || []).filter(
    (b) => b.status === 'COMPLETED' && !['FAILED', 'REFUNDED'].includes(b.paymentStatus)
  );
  const trustScore = stats?.metrics?.trustScore || stats?.provider?.trustScore || 85;
  const rewardsPoints = stats?.rewards?.points ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('worker_history_page_title', 'Verified Platform Work History & Portable Credit')}
        description={t(
          'worker_history_page_desc',
          'Every completed CoopServe job creates an immutable, verified digital service credential that builds your Trust Score, cooperative pension credit, and rewards.'
        )}
        breadcrumbs={[t('nav_dashboard', 'Home'), t('worker_menu_history', 'Work History')]}
        badge={
          <Badge variant="success" size="sm">
            {t('worker_platform_verified_badge', '✓ 100% Platform Verified')}
          </Badge>
        }
      />

      {/* Trust Score & Portable Credential Showcase Banner */}
      <Card className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="protected" size="sm">
                {t('worker_portable_worker_credit', 'Portable Worker Credit')}
              </Badge>
              <Badge variant="coop" size="sm">
                {rewardsPoints} {t('worker_coop_reward_points_badge', 'Cooperative Reward Points')}
              </Badge>
            </div>
            <h3 className="text-xl font-black text-white">
              {t('worker_anti_leakage_title', 'Your Anti-Leakage Cooperative Record')}
            </h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              {t(
                'worker_anti_leakage_desc',
                'By completing jobs through CoopServe, your credentials, ratings, and digital earnings are permanently recorded. New workers begin with 0 completed records. Each verified completion increases matching priority and unlocks rewards.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex flex-col items-center justify-center font-black shadow-lg">
              <span className="text-2xl leading-none text-white">{trustScore}</span>
              <span className="text-[10px] text-indigo-200">/100</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase">{t('worker_stat_trust_score', 'CoopServe Trust Score')}</p>
              <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                {completedBookings.length > 0
                  ? `${completedBookings.length} ${t('worker_verified_jobs_completed_sub', 'Verified Jobs Completed')}`
                  : t('worker_new_member_standing', 'New Member Standing')}
              </p>
              <span className="text-[10px] text-indigo-200">{t('worker_dispute_free_record', 'Dispute-Free Service Record')}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Verified Jobs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {t('worker_completed_job_log_title', 'Completed Job Log')} ({completedBookings.length})
          </h3>
          <span className="text-xs text-slate-400">
            {t('worker_excludes_cancelled_sub', 'Excludes cancelled, failed, or refunded bookings')}
          </span>
        </div>

        {completedBookings.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={t('worker_no_completed_jobs_title', 'No completed jobs recorded yet')}
            description={t(
              'worker_no_completed_jobs_desc',
              'As soon as you finish a service booking and mark it completed, it will appear here as an authentic, verified record.'
            )}
          />
        ) : (
          <div className="space-y-3">
            {completedBookings.map((b) => (
              <Card key={b.id || b._id} className="p-4 border border-slate-200/90 hover:border-emerald-500 transition-all bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{b.serviceTitle}</h4>
                      <Badge variant="success" size="sm">✓ {t('worker_badge_protected', 'Verified CoopServe Job')}</Badge>
                    </div>
                    <p className="text-slate-600 font-medium">
                      {t('worker_customer_label', 'Customer')}: <strong className="text-slate-900">{b.customerName}</strong> • {b.address}
                    </p>
                    <div className="flex items-center gap-4 text-slate-400 text-[11px] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {b.date} at {b.time}
                      </span>
                      <span>Booking ID: <strong className="text-slate-600">{b.id}</strong></span>
                      {b.transactionId && (
                        <span>Txn: <strong className="text-slate-600">{b.transactionId}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex sm:flex-col justify-between items-end">
                    <span className="text-emerald-800 font-black text-base">+₹{b.pricing?.workerEarnings ?? 0}</span>
                    {b.rating ? (
                      <span className="text-[10px] text-slate-700 flex items-center gap-1 font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {Number(b.rating).toFixed(1)} {t('worker_rating_verified', 'Rating (Verified)')}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {t('worker_not_rated_by_customer', 'Not yet rated by customer')}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
