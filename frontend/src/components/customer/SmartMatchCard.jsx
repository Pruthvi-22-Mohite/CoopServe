import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import {
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Check
} from 'lucide-react';

export const SmartMatchCard = ({ matchResult, onBook }) => {
  const navigate = useNavigate();

  if (!matchResult) return null;

  const provider = matchResult.topMatch || matchResult;
  const matchScore = provider.matchScore ?? 0;
  const reasons = provider.reasons || [];

  const breakdown = provider.scoreBreakdown || {
    skillScore: 0,
    distanceScore: 0,
    availabilityScore: 0,
    ratingScore: 0,
    workloadFairnessScore: 0,
    trustScore: 0
  };

  return (
    <Card className="p-0 overflow-hidden border-2 border-emerald-500 shadow-xl bg-white">
      {/* Top Banner: AI Recommended Header with Score */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                AI SMART MATCH
              </span>
              <Badge variant="success" size="sm">
                Fair Balanced
              </Badge>
            </div>
            <h3 className="text-base font-bold text-white">Best Suited Cooperative Provider</h3>
          </div>
        </div>

        {/* Large Score Pill */}
        <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Match Score</span>
            <span className="text-xl font-black text-white">{matchScore}%</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-300">
            {matchScore}
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Provider Profile Snippet (5 cols) */}
        <div className="lg:col-span-5 space-y-4 pb-4 lg:pb-0 lg:border-r border-slate-100 pr-0 lg:pr-6">
          <div className="flex items-start gap-4">
            <Avatar
              src={provider.avatar}
              name={provider.name}
              size="lg"
              isVerified={provider.isVerified}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-base text-slate-900">{provider.name}</h4>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-emerald-800">{provider.skill}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {provider.location} ({provider.distanceKm ?? 0} km)
              </p>
            </div>
          </div>

          {/* Core Metrics Row */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs">
            <div>
                <span className="font-bold text-slate-800 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {provider.rating ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">Rating</span>
            </div>
            <div className="border-x border-slate-200">
                <span className="font-bold text-indigo-700 flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5" /> {provider.trustScore ?? 0}
              </span>
              <span className="text-[10px] text-slate-400">Trust Score</span>
            </div>
            <div>
              <span className="font-bold text-emerald-700 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Today
              </span>
              <span className="text-[10px] text-slate-400">Availability</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-800">Base Service Price</span>
              <span className="text-lg font-black text-slate-900 block">Starting from ₹{provider.startingPrice ?? 0}</span>
              <span className="text-[10px] text-slate-500 block">+ Travel fee ({provider.distanceKm ?? 0} km)</span>
            </div>
            <Badge variant="protected" size="sm">
              90% Worker Net
            </Badge>
          </div>
        </div>

        {/* AI Explanatory Checklist & Factor Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Why CoopServe Recommends This Provider:
            </h4>
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span className={reason.includes('Fair Workload') ? 'font-bold text-teal-800' : 'font-medium'}>
                    {reason.replace(/^✓\s*/, '')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Factors Radar/Bars Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Skill</span>
                <span className="font-bold text-slate-900">{breakdown.skillScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1"><div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${breakdown.skillScore}%` }} /></div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Distance Proximity</span>
                <span className="font-bold text-slate-900">{breakdown.distanceScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1"><div className="bg-teal-500 h-1 rounded-full" style={{ width: `${breakdown.distanceScore}%` }} /></div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex justify-between text-slate-600 mb-1">
                <span className="font-bold text-teal-800">Fair Workload</span>
                <span className="font-bold text-teal-800">{breakdown.workloadFairnessScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1"><div className="bg-amber-500 h-1 rounded-full" style={{ width: `${breakdown.workloadFairnessScore}%` }} /></div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => navigate(`/customer/provider/${provider.id}`)}
            >
              View Full Profile
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto shadow-md"
              onClick={() => {
                if (onBook) onBook(provider);
                else navigate(`/customer/provider/${provider.id}`);
              }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Book Recommended Pro
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
