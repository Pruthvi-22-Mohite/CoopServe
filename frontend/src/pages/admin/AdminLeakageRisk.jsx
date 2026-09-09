import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Info,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AdminLeakageRisk = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminLeakageRisk();
        if (res.success && res.analytics) {
          setData(res.analytics);
        }
      } catch (err) {
        console.error('Error fetching leakage analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSignals();
  }, []);

  if (isLoading) {
    return <LoadingState message={t('admin_leakage_loading')} />;
  }

  const {
    totalBookings = 0,
    totalCancellations = 0,
    cancellationRate = '0%',
    customerCancellations = 0,
    providerCancellations = 0,
    cancellationAfterAssignment = 0,
    visibleRiskSignals = [],
    retentionPolicy = ''
  } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_leakage_title')}
        description={t('admin_leakage_desc')}
        breadcrumbs={[t('nav_home'), t('role_admin_portal'), t('admin_leakage_title')]}
        badge={
          <Badge variant="warning" size="sm">
            {t('admin_leakage_badge')}
          </Badge>
        }
      />

      {/* Primary Cancellation KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('admin_leakage_stat_rate')}
          value={cancellationRate}
          icon={XCircle}
          trend={{ direction: 'down', text: t('admin_leakage_trend_below') }}
          variant="success"
        />
        <StatCard
          title={t('admin_leakage_stat_cust_cancels')}
          value={customerCancellations}
          icon={Clock}
          trend={{ direction: 'up', text: t('admin_leakage_trend_sched') }}
          variant="primary"
        />
        <StatCard
          title={t('admin_leakage_stat_prov_declines')}
          value={providerCancellations}
          icon={XCircle}
          trend={{ direction: 'down', text: t('admin_leakage_trend_emerg') }}
          variant="info"
        />
        <StatCard
          title={t('admin_leakage_stat_after_assign')}
          value={cancellationAfterAssignment}
          icon={AlertTriangle}
          trend={{ direction: 'up', text: t('admin_leakage_trend_frict') }}
          variant="warning"
        />
      </div>

      {/* Ethical Observation Policy Notice */}
      <Card className="p-5 bg-gradient-to-r from-amber-900 to-slate-900 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
          <Info className="w-4 h-4" />
          <span>{t('admin_leakage_ethic_principle')}</span>
        </div>
        <h3 className="text-base font-black text-white">{t('admin_leakage_ethic_title')}</h3>
        <p className="text-xs text-amber-100/90 leading-relaxed max-w-3xl">
          {t('admin_leakage_ethic_body')}
        </p>
      </Card>

      {/* Visible Pattern Telemetry Signals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>{t('admin_leakage_signals_title')} ({visibleRiskSignals.length})</span>
          </h3>
          <span className="text-xs text-slate-400">{t('admin_leakage_signals_sub')}</span>
        </div>

        <div className="space-y-4">
          {visibleRiskSignals.length === 0 ? (
            <Card className="p-5 bg-white border border-slate-200">
              <p className="text-xs text-slate-500">{t('admin_leakage_no_signals')}</p>
            </Card>
          ) : (
            visibleRiskSignals.map((signal) => (
              <Card key={signal.id} className="p-5 bg-white border border-amber-200/90 shadow-soft space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={signal.severity === 'Moderate' ? 'warning' : 'info'} size="sm">
                      {signal.severity} {t('admin_leakage_priority')}
                    </Badge>
                    <h4 className="font-extrabold text-sm text-slate-900">{signal.pattern}</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{signal.affectedCount} {t('admin_stat_total_bookings')}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('admin_leakage_obs_label')}</span>
                    <p className="text-slate-700 mt-0.5">{signal.observationKey ? t(signal.observationKey, signal.observation) : signal.observation}</p>
                    <p className="text-[11px] text-amber-800 font-semibold mt-1">
                      {t('admin_leakage_reason_label')}: {signal.systemReasonKey ? t(signal.systemReasonKey, signal.systemReason) : signal.systemReason}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">{t('admin_leakage_rec_label')}</span>
                    <p className="text-emerald-950 font-medium mt-0.5">
                      {signal.recommendedInterventionKey ? t(signal.recommendedInterventionKey, signal.recommendedIntervention) : signal.recommendedIntervention}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 4 Pillars of Retention */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">{t('admin_leakage_why_stay')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <Card className="p-4 bg-white border border-slate-200">
            <h5 className="font-bold text-slate-900">{t('admin_leakage_p1_title')}</h5>
            <p className="text-slate-500 mt-1">{t('admin_leakage_p1_desc')}</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <h5 className="font-bold text-slate-900">{t('admin_leakage_p2_title')}</h5>
            <p className="text-slate-500 mt-1">{t('admin_leakage_p2_desc')}</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <h5 className="font-bold text-slate-900">{t('admin_leakage_p3_title')}</h5>
            <p className="text-slate-500 mt-1">{t('admin_leakage_p3_desc')}</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <h5 className="font-bold text-slate-900">{t('admin_leakage_p4_title')}</h5>
            <p className="text-slate-500 mt-1">{t('admin_leakage_p4_desc')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
