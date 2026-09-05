import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
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
    return <LoadingState message="Analyzing platform pattern telemetry and retention signals..." />;
  }

  const {
    totalBookings = 4894,
    totalCancellations = 118,
    cancellationRate = '2.4%',
    customerCancellations = 78,
    providerCancellations = 40,
    cancellationAfterAssignment = 32,
    visibleRiskSignals = [],
    retentionPolicy = 'Value-First Anti-Leakage (Portable worker credits + 30-day warranty guarantee)'
  } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cancellation Patterns & Platform Retention Telemetry"
        description="Monitor internal on-platform booking cancellation trends and deploy value-first cooperative incentives to maintain service recording."
        breadcrumbs={['Home', 'Admin', 'Cancellation & Leakage']}
        badge={
          <Badge variant="warning" size="sm">
            Ethical Audit Active
          </Badge>
        }
      />

      {/* Primary Cancellation KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Cancellation Rate"
          value={cancellationRate}
          icon={XCircle}
          trend={{ direction: 'down', text: 'Well below 5% platform baseline' }}
          variant="success"
        />
        <StatCard
          title="Customer Cancellations"
          value={customerCancellations}
          icon={Clock}
          trend={{ direction: 'up', text: 'Schedule changes & wrong categories' }}
          variant="primary"
        />
        <StatCard
          title="Provider Declines"
          value={providerCancellations}
          icon={XCircle}
          trend={{ direction: 'down', text: 'Emergency or off-duty slots' }}
          variant="info"
        />
        <StatCard
          title="Cancelled After Assignment"
          value={cancellationAfterAssignment}
          icon={AlertTriangle}
          trend={{ direction: 'up', text: 'Potential Leakage Pattern Area' }}
          variant="warning"
        />
      </div>

      {/* Ethical Observation Policy Notice */}
      <Card className="p-5 bg-gradient-to-r from-amber-900 to-slate-900 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
          <Info className="w-4 h-4" />
          <span>COOPERATIVE ETHICAL OBSERVATION PRINCIPLE</span>
        </div>
        <h3 className="text-base font-black text-white">Value-Driven Retention vs Aggressive Surveillance</h3>
        <p className="text-xs text-amber-100/90 leading-relaxed max-w-3xl">
          CoopServe never attempts private communication surveillance or off-platform payment tracking. Instead, we analyze patterns visible within CoopServe to continuously increase the concrete value of staying protected on-platform (e.g. 30-day rework warranty, dispute council, and verified portable credit).
        </p>
      </Card>

      {/* Visible Pattern Telemetry Signals */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Visible Platform Friction & Leakage Signals ({visibleRiskSignals.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Aggregated on-platform behavioral observations</span>
        </div>

        <div className="space-y-4">
          {visibleRiskSignals.map((signal) => (
            <Card key={signal.id} className="p-5 bg-white border border-amber-200/90 shadow-soft space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={signal.severity === 'Moderate' ? 'warning' : 'info'} size="sm">
                    {signal.severity} Priority
                  </Badge>
                  <h4 className="font-extrabold text-sm text-slate-900">{signal.pattern}</h4>
                </div>
                <span className="text-xs font-bold text-slate-500">{signal.affectedCount}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">On-Platform Observation</span>
                  <p className="text-slate-700 mt-0.5">{signal.observation}</p>
                  <p className="text-[11px] text-amber-800 font-semibold mt-1">Reason: {signal.systemReason}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Recommended Positive Intervention</span>
                  <p className="text-emerald-950 font-medium mt-0.5">{signal.recommendedIntervention}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 4 Pillars of Retention */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Why Workers & Customers Choose to Stay On CoopServe</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <Card className="p-4 bg-white border border-slate-200">
            <h5 className="font-bold text-slate-900">30-Day Rework Warranty</h5>
            <p className="text-slate-500 mt-1">Only protected bookings qualify for free repair rework in case of issue.</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <h5 className="font-bold text-slate-900">Verified Career Record</h5>
            <p className="text-slate-500 mt-1">Off-platform jobs cannot be added to portable Trust Score or pension credits.</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <h5 className="font-bold text-slate-900">90% Direct Payouts</h5>
            <p className="text-slate-500 mt-1">Guaranteed 90% take-home rate with transparent 10% platform operations.</p>
          </Card>
          <Card className="p-4 bg-white border border-slate-200">
            <h5 className="font-bold text-slate-900">Dispute Council</h5>
            <p className="text-slate-500 mt-1">Neutral peer-worker arbitration protecting both customer and pro.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
