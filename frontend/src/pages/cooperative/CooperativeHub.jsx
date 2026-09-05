import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import {
  HeartHandshake,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  Vote,
  GraduationCap,
  Scale,
  DollarSign,
  IndianRupee,
  CheckCircle2,
  Cpu,
  Info,
  Layers
} from 'lucide-react';

export const CooperativeHub = () => {
  const { showToast } = useToast();
  const [coopData, setCoopData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    const fetchCoop = async () => {
      setIsLoading(true);
      try {
        const res = await api.getCooperativeOverview();
        if (res.success && res.cooperative) {
          setCoopData(res.cooperative);
        }
      } catch (err) {
        console.error('Error fetching cooperative hub data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoop();
  }, []);

  if (isLoading) {
    return <LoadingState message="Connecting to cooperative community reserve & fair distribution metrics..." />;
  }

  const {
    name = 'Maharashtra Sahakari Seva Sanstha (CoopServe)',
    totalMembers = 128,
    totalCompletedJobs = 1240,
    trainingProgramsCount = 8,
    communityInitiativesCount = 12,
    fairWorkloadDistributionIndex = '87%',
    workloadDistribution = [],
    benefitsList = [],
    trainingPrograms = [],
    communityInitiatives = []
  } = coopData || {};

  const handleVote = () => {
    setVoted(true);
    showToast('Your democratic member vote has been recorded on the cooperative ledger!', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cooperative Ecosystem & Community Governance"
        description="CoopServe is democratically owned by local gig professionals. 90% direct earnings, transparent pricing, verified work history, and collective member voice."
        breadcrumbs={['Home', 'Cooperative']}
        badge={
          <Badge variant="coop" size="sm">
            Society Reg: COOP-MH-2024
          </Badge>
        }
      />

      {/* Hero Banner: Cooperative Governance & Shared Values */}
      <Card className="p-6 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">Democratic Member Ownership</Badge>
              <Badge variant="protected" size="sm">Fair Workload Allocation</Badge>
            </div>
            <h2 className="text-2xl font-black text-white">{name}</h2>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              “CoopServe replaces exploitative middleman gig platforms with an AI-driven worker cooperative. Every member has equal voting rights, verified portable credentials, and protection against wage starvation.”
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-300 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>128 verified local technicians actively collaborating in Pune</span>
            </div>
          </div>

          {/* Large Certified Members Pill */}
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-center shrink-0 min-w-[240px]">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
              Cooperative Members
            </span>
            <span className="text-3xl font-black text-white mt-1 block">
              {totalMembers} Certified
            </span>
            <span className="text-[10px] text-emerald-200 mt-1 block">
              100% Member Governed in Pune
            </span>
          </div>
        </div>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Co-op Members"
          value={totalMembers}
          icon={Users}
          trend={{ direction: 'up', text: 'Verified Pune professionals' }}
          variant="primary"
        />
        <StatCard
          title="Total Completed Jobs"
          value={totalCompletedJobs.toLocaleString()}
          icon={CheckCircle2}
          trend={{ direction: 'up', text: '100% verified work history' }}
          variant="success"
        />
        <StatCard
          title="Training Programs"
          value={trainingProgramsCount}
          icon={GraduationCap}
          trend={{ direction: 'up', text: 'Active upskilling tracks' }}
          variant="info"
        />
        <StatCard
          title="Fair Workload Index"
          value={fairWorkloadDistributionIndex}
          icon={Scale}
          trend={{ direction: 'up', text: 'Balanced allocation score' }}
          variant="warning"
        />
      </div>

      {/* SECTION 1: FAIR WORKLOAD DISTRIBUTION & SMART MATCHING EXPLANATION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <span>Cooperative Fair Workload Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Smart matching considers current queue to prevent top-star exhaustion and create fairer job opportunities across all qualified members.
            </p>
          </div>
          <Badge variant="coop" size="sm">
            Anti-Starvation Algorithm Active
          </Badge>
        </div>

        {/* Workload Comparison Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workloadDistribution.map((prov) => {
            const isBoosted = prov.jobsThisWeek <= 7;
            return (
              <Card
                key={prov.id}
                className={`p-4 border transition-all ${
                  isBoosted
                    ? 'border-emerald-400 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200/90 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={prov.avatar} name={prov.name} size="md" isVerified={true} />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{prov.name}</h4>
                      <p className="text-[10px] text-slate-500">{prov.skill}</p>
                    </div>
                  </div>
                  <Badge variant={isBoosted ? 'success' : 'protected'} size="sm">
                    {prov.jobsThisWeek} Jobs / Wk
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Fair Allocation Priority</span>
                    <span className="font-black text-emerald-800">{prov.fairnessScore}%</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isBoosted ? 'bg-emerald-600' : 'bg-teal-500'
                      }`}
                      style={{ width: `${prov.fairnessScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-slate-400">{prov.location}</span>
                    <span className={isBoosted ? 'font-bold text-emerald-700' : 'text-slate-500'}>
                      {prov.fairnessTier}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Explainability Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">How CoopServe Solves Gig Worker Inequality:</p>
            <p className="text-amber-800/90 leading-relaxed">
              “If two providers are similarly qualified, CoopServe's matching engine awards a higher fairness score to the provider with fewer weekly jobs (e.g. 7 jobs vs 20 jobs). This creates balanced livelihood opportunities while maintaining top-quality service for customers.”
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: 7 WORKER BENEFITS & ANTI-LEAKAGE PILLARS */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Core Cooperative Worker Protections & Portable Value</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {benefitsList.map((ben, idx) => (
            <Card key={idx} className="p-4 bg-white border border-slate-200/90 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{ben.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                {ben.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION 3: SUBSIDIZED TRAINING PROGRAMS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span>Co-Sponsored Master Upskilling Programs</span>
          </h3>
          <span className="text-xs text-slate-500">Cooperative certified vocational upskilling</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trainingPrograms.map((tr) => (
            <Card key={tr.id} className="p-4 bg-white border border-slate-200/90 flex flex-col justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <Badge variant="coop" size="sm">{tr.stipend}</Badge>
                  <span className="text-[10px] text-slate-400 font-medium">Starts: {tr.date}</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 mt-1">{tr.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Duration: {tr.duration} • {tr.seatsLeft} Seats Remaining</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-bold">100% Fee Covered for Members</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showToast(`Enrolled in ${tr.title}! Confirmation sent to your phone.`, 'success')}
                >
                  Enroll Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION 4: DEMOCRATIC COMMUNITY INITIATIVES & VOTING */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Vote className="w-5 h-5 text-emerald-600" />
          <span>Democratic Initiatives & Member Participation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityInitiatives.map((init) => (
            <Card key={init.id} className="p-5 bg-white border border-slate-200/90 flex flex-col justify-between gap-3 shadow-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant={init.status.includes('Open') ? 'warning' : 'success'} size="sm">
                    {init.status}
                  </Badge>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{init.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{init.desc}</p>
              </div>

              {init.id === 'init_1' && (
                <div className="pt-2 border-t border-slate-100">
                  <Button
                    variant={voted ? 'success' : 'primary'}
                    size="sm"
                    className="w-full"
                    disabled={voted}
                    onClick={handleVote}
                    leftIcon={<Vote className="w-3.5 h-3.5" />}
                  >
                    {voted ? '✓ Member Vote Cast' : 'Cast Member Vote (1 Member 1 Vote)'}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Prototype Governance Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-500">
        CoopServe is an enterprise cooperative platform prototype illustrating transparent gig economics, verified work credentials, and collective worker governance.
      </div>
    </div>
  );
};
