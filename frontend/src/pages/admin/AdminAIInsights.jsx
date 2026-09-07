import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import {
  TrendingUp,
  Cpu,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  Users,
  Layers,
  Scale,
  Code
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
  Legend,
  LineChart,
  Line
} from 'recharts';

export const AdminAIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminAIInsights();
        if (res.success) {
          setInsights(res);
        }
      } catch (err) {
        console.error('Error fetching AI insights:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAI();
  }, []);

  if (isLoading) {
    return <LoadingState message="Running predictive demand modeling and locality capacity forecasting..." />;
  }

  const {
    serviceDemand = [],
    hourlyPeakTrend = [],
    weeklyForecast = [],
    localityBalance = [],
    ecosystemFeedback = {}
  } = insights || {};

  const getDemandBadge = (level) => {
    switch (level) {
      case 'High':
        return <Badge variant="danger" size="sm">🔥 High Demand</Badge>;
      case 'Medium':
        return <Badge variant="warning" size="sm">⚡ Medium Demand</Badge>;
      case 'Low':
      default:
        return <Badge variant="info" size="sm">Normal Baseline</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Predictive Demand & Capacity Allocation"
        description="Forecast trade-level booking spikes, detect localized provider shortages, and optimize cooperative work distribution across Pune."
        breadcrumbs={['Home', 'Admin', 'AI Demand Insights']}
        badge={
          <Badge variant="protected" size="sm">
            Predictive Engine v1.0
          </Badge>
        }
      />

      {/* Architecture & Open Disclosure Banner */}
      <Card className="p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-teal-950 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
          <Cpu className="w-4 h-4" />
          <span>MODULAR ARCHITECTURE SPECIFICATION</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-lg font-black text-white">Rule-Based Predictive Prototype</h3>
            <p className="text-xs text-indigo-200/90 leading-relaxed">
              This engine uses transparent, rule-based heuristics across historical booking frequency, weather/municipal schedules, and active technician queues in Pune. Structured with clean JSON interfaces for plug-and-play proxying to Python FastAPI + Scikit-Learn.
            </p>
          </div>

          {/* Architecture Pipeline Badge */}
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-mono shrink-0 text-emerald-200 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold font-sans">Pipeline Flow:</p>
            <p className="font-bold">React (Vite) ➔ Express ➔ FastAPI ➔ Scikit-Learn</p>
          </div>
        </div>
      </Card>

      {/* SECTION 1: SERVICE DEMAND TIERS & PROMPT RECOMMENDATIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Predicted Service Demand by Trade</span>
          </h3>
          <span className="text-xs text-slate-500">Next 24h to 48h Outlook for Pune</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceDemand.map((srv, idx) => (
            <Card
              key={idx}
              className={`p-5 space-y-3 border transition-all ${
                srv.level === 'High'
                  ? 'bg-amber-50/40 border-amber-300 shadow-soft'
                  : 'bg-white border-slate-200/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-slate-900">{srv.category}</h4>
                  {getDemandBadge(srv.level)}
                </div>
                <span className="text-xs font-black text-emerald-700">{srv.growthRate}</span>
              </div>

              {/* Demand Details & Peak Hours */}
              <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Peak Hours:</span>
                  <strong className="text-slate-900">{srv.peakHours}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Active Pros vs Required:</span>
                  <strong className={srv.shortage > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                    {srv.availableProviders} / {srv.requiredProviders} Pros ({srv.shortage > 0 ? `-${srv.shortage} Shortage` : 'Balanced'})
                  </strong>
                </div>
              </div>

              {/* Prediction Text & Action Recommendation */}
              <div className="space-y-1 text-xs">
                <p className="text-slate-600 leading-relaxed italic">
                  "{srv.predictionText}"
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-emerald-900 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{srv.recommendation}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION 2: HOURLY PEAK DEMAND VS ACTIVE CAPACITY CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 24-Hour Demand Curve (8 cols) */}
        <div className="lg:col-span-8">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Hourly Peak Demand vs Field Capacity</h3>
                <p className="text-xs text-slate-500">Pune booking request volume vs available technician capacity (24h Index)</p>
              </div>
              <Badge variant="primary" size="sm">09 AM & 05 PM Peaks</Badge>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyPeakTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="capacityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip formatter={(val) => [`${val} Index`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="demand" name="Customer Booking Demand" stroke="#f59e0b" fillOpacity={1} fill="url(#demandGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="capacity" name="Available Tech Capacity" stroke="#059669" fillOpacity={1} fill="url(#capacityGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* 7-Day Forward Forecast (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">7-Day Booking Forecast</h3>
              <p className="text-xs text-slate-500">Anticipated weekend surge in Pune</p>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" name="Actual Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="predicted" name="AI Forecast" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION 3: LOCALITY CAPACITY BALANCE MATRIX IN PUNE */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <span>Pune Locality Capacity & Shortage Heatmap</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {localityBalance.map((loc, idx) => (
            <Card
              key={idx}
              className={`p-4 border text-xs space-y-2 ${
                loc.status.includes('Shortage')
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900">{loc.locality}</span>
                <Badge variant={loc.status.includes('Shortage') ? 'warning' : 'success'} size="sm">
                  {loc.status}
                </Badge>
              </div>

              <div className="flex justify-between text-slate-600 pt-1">
                <span>Demand Activity Index:</span>
                <strong className="text-slate-900">{loc.demandScore}/100</strong>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Active Assigned Pros:</span>
                <strong className="text-slate-900">{loc.activePros} Techs</strong>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION 4: HOLISTIC SMART MATCHING FEEDBACK LOOP */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-emerald-950 text-white shadow-xl space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            HOLISTIC ECOSYSTEM EQUILIBRIUM
          </span>
          <h3 className="text-lg font-black text-white mt-0.5">
            How AI Matching + Availability + Workload + Demand Interact
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-300">1. Demand Forecasting</span>
            <p className="text-white font-bold">Predicts Bottlenecks</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Detects surges (e.g. +38% plumbing) and alerts off-duty certified members before shortages occur.
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-teal-300">2. Real-Time Duty</span>
            <p className="text-white font-bold">Location-Radius Filter</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Restricts matching to providers within a 2km to 5km radius to maintain under-30-min transit times.
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-300">3. Fair Workload Balancing</span>
            <p className="text-white font-bold">Equal Opportunity</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Prioritizes qualified members with fewer weekly jobs to prevent star-worker fatigue and solve income inequality.
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-300">4. Trust Score Telemetry</span>
            <p className="text-white font-bold">100% Quality Assurance</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Ensures every dispatch has verified history, zero recent disputes, and active 30-day warranty backing.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
