import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Cpu,
  ShieldCheck,
  Scale,
  Sparkles,
  Search,
  CheckCircle2,
  Sliders,
  Layers
} from 'lucide-react';

export const AdminMatchingInspector = () => {
  const { t } = useLanguage();
  const [matchingData, setMatchingData] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState('plumbing');
  const [simulatedMatch, setSimulatedMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const fetchInspection = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminMatching();
        if (res.success) setMatchingData(res);
      } catch (err) {
        console.error('Error fetching matching inspection:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInspection();
  }, []);

  const runSimulation = async (trade) => {
    setSelectedTrade(trade);
    setIsSimulating(true);
    try {
      const res = await api.smartMatch({ category: trade });
      if (res.success) {
        setSimulatedMatch(res);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    runSimulation('plumbing');
  }, []);

  if (isLoading) {
    return <LoadingState message={t('admin_matching_loading')} />;
  }

  const { activeDispatches = [], weights = {} } = matchingData || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_matching_title')}
        description={t('admin_matching_desc')}
        breadcrumbs={['Home', 'Admin', 'AI Matching']}
        badge={
          <Badge variant="success" size="sm">
            Fair Algo v1.0
          </Badge>
        }
      />

      {/* Algorithmic Weights Distribution Matrix */}
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white shadow-xl space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            NORMALIZED WEIGHTING MATRIX
          </span>
          <h3 className="text-xl font-black text-white mt-1">
            CoopServe Multi-Factor Transparent Formula
          </h3>
          <p className="text-xs text-indigo-100 max-w-2xl mt-1 leading-relaxed">
            Every dispatch score is calculated through open, transparent factors without arbitrary black-box penalization.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {[
            { label: 'Skill Match', weight: '30%', color: 'border-emerald-400 text-emerald-300' },
            { label: 'Proximity', weight: '15%', color: 'border-teal-400 text-teal-300' },
            { label: 'Availability', weight: '15%', color: 'border-cyan-400 text-cyan-300' },
            { label: 'Rating', weight: '15%', color: 'border-amber-400 text-amber-300' },
            { label: 'Fair Workload', weight: '10%', color: 'border-rose-400 text-rose-300 font-black' },
            { label: 'Trust Score', weight: '10%', color: 'border-indigo-400 text-indigo-300' },
            { label: 'Experience', weight: '5%', color: 'border-slate-400 text-slate-300' }
          ].map((w, idx) => (
            <div key={idx} className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-center">
              <span className={`text-base font-black ${w.color} block`}>{w.weight}</span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold mt-0.5 block">{w.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Simulation Sandbox */}
      <Card className="p-5 bg-white border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Live Algorithm Match Sandbox</span>
            </h3>
            <p className="text-xs text-slate-500">Test how the algorithm evaluates candidate pools for different trade categories.</p>
          </div>

          {/* Trade Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['plumbing', 'electrical', 'cleaning', 'appliance', 'carpentry', 'gardening'].map((cat) => (
              <button
                key={cat}
                onClick={() => runSimulation(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  selectedTrade === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Top Recommendation & Breakdown */}
        {simulatedMatch?.topMatch && (
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">Top AI Pick</Badge>
                  <span className="text-sm font-black text-slate-900">{simulatedMatch.topMatch.name}</span>
                  <span className="text-xs text-slate-500">({simulatedMatch.topMatch.skill})</span>
                </div>
                <p className="text-xs text-emerald-800 font-semibold mt-1">
                  Location: {simulatedMatch.topMatch.location} ({simulatedMatch.topMatch.distanceKm} km away)
                </p>
              </div>

              <div className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-black text-sm shrink-0">
                <span>{simulatedMatch.topMatch.matchScore}% Match Score</span>
              </div>
            </div>

            {/* Score Factor Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs pt-2 border-t border-emerald-200/60">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] block">Skill Match</span>
                <span className="font-black text-slate-900">{simulatedMatch.topMatch.scoreBreakdown?.skillScore}%</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] block">Distance Proximity</span>
                <span className="font-black text-slate-900">{simulatedMatch.topMatch.scoreBreakdown?.distanceScore}%</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] block">Availability</span>
                <span className="font-black text-slate-900">{simulatedMatch.topMatch.scoreBreakdown?.availabilityScore}%</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] block">Rating Score</span>
                <span className="font-black text-slate-900">{simulatedMatch.topMatch.scoreBreakdown?.ratingScore}%</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-emerald-700 font-bold text-[10px] block">Fair Workload</span>
                <span className="font-black text-emerald-800">{simulatedMatch.topMatch.scoreBreakdown?.workloadFairnessScore}%</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-slate-400 text-[10px] block">Trust Score</span>
                <span className="font-black text-indigo-700">{simulatedMatch.topMatch.scoreBreakdown?.trustScore}%</span>
              </div>
            </div>

            {/* Explanatory Reasons */}
            <div className="space-y-1 text-xs pt-1">
              <span className="font-bold text-slate-700 uppercase text-[10px]">Generated Explanatory Reasons:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-600">
                {simulatedMatch.topMatch.reasons?.map((r, i) => (
                  <p key={i} className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span> {r.replace(/^✓\s*/, '')}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
