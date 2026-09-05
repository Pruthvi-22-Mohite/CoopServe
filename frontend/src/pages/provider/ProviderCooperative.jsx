import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  Building,
  CheckCircle2,
  BookOpen,
  Vote,
  Compass,
  Zap,
  Hammer
} from 'lucide-react';

export const ProviderCooperative = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cooperative Member Portal & Upskilling"
        description="Equal member-owner representation in CoopServe: democratic voting, fair workload balancing, advanced vocational certifications, and verified credentials."
        breadcrumbs={['Home', 'Cooperative']}
        badge={
          <Badge variant="coop" size="sm">
            Member ID: COOP-MH-2024-001
          </Badge>
        }
      />

      {/* Cooperative Community Banner */}
      <Card className="p-6 bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              MAHARASHTRA SAHAKARI SEVA SANSTHA
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              CoopServe Member Professional Network
            </h3>
            <p className="text-xs text-teal-100 max-w-2xl mt-1 leading-relaxed">
              Collective worker governance without venture capital extraction. Equal 1-member 1-vote representation on service standards, training opportunities, fair queue allocation, and dispute arbitration.
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-2xl font-black text-emerald-300">128</span>
            <span className="text-[10px] uppercase font-bold text-white block mt-0.5">Active Certified Pros</span>
          </div>
        </div>
      </Card>

      {/* 4 Pillars of Cooperative Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-slate-200/90 space-y-2 bg-white">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Fair Job Distribution</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            AI-driven queue balancing ensures new members receive equal dispatch opportunities without gig starvation.
          </p>
          <Badge variant="success" size="sm">87% Balanced Queue</Badge>
        </Card>

        <Card className="p-5 border border-slate-200/90 space-y-2 bg-white">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-teal-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Vocational Upskilling</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hands-on masterclasses in rooftop solar, micro-inverters, inverter HVAC, and modern smart home automation.
          </p>
          <Badge variant="coop" size="sm">8 Active Programs</Badge>
        </Card>

        <Card className="p-5 border border-slate-200/90 space-y-2 bg-white">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Verified Work Credential</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every completed service builds your tamper-proof work record, unlocking priority matching and master artisan status.
          </p>
          <Badge variant="warning" size="sm">Portable Record</Badge>
        </Card>

        <Card className="p-5 border border-slate-200/90 space-y-2 bg-white">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Vote className="w-5 h-5 text-indigo-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Democratic Member Voice</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            1 Member 1 Vote policy. Participate directly in deciding tool standards, service quality criteria, and cooperative resolutions.
          </p>
          <Badge variant="info" size="sm">1 Member 1 Vote</Badge>
        </Card>
      </div>
    </div>
  );
};
