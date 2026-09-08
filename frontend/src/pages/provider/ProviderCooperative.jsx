import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ShieldCheck,
  Award,
  BookOpen,
  Vote,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const ProviderCooperative = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPoll = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.getGovernancePoll();
      if (res?.success && res.poll) {
        setPoll(res.poll);
        setHasVoted(Boolean(res.poll.hasVoted));
        setSelectedOption('');
      }
    } catch (err) {
      setError(err.message || 'Unable to load the active cooperative poll.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, []);

  const handleVoteSubmit = async () => {
    if (!selectedOption || !poll) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.submitGovernanceVote(poll.id, selectedOption);
      if (res?.success) {
        setHasVoted(true);
        setSelectedOption(res.vote?.selectedOption || selectedOption);
        setPoll(res.poll || poll);
        showToast(res.message || t('worker_vote_success_toast', 'Vote recorded successfully.'), 'success');
      }
    } catch (err) {
      setError(err.message || 'Your vote could not be submitted.');
      showToast(err.message || t('worker_vote_fail_toast', 'Voting failed.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionLabel = (value) => {
    if (!poll) return value;
    return poll.options.find((option) => option.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('worker_coop_page_title', 'Cooperative Member Portal & Upskilling')}
        description={t(
          'worker_coop_page_desc',
          'Equal member-owner representation in CoopServe: democratic voting, fair workload balancing, advanced vocational certifications, and verified credentials.'
        )}
        breadcrumbs={[t('nav_dashboard', 'Home'), t('nav_cooperative', 'Cooperative')]}
        badge={
          <Badge variant="coop" size="sm">
            Member ID: {user?.id || 'COOP-MH-2024-001'}
          </Badge>
        }
      />

      <Card className="p-6 bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              MAHARASHTRA SAHAKARI SEVA SANSTHA
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              {t('worker_coop_member_network', 'CoopServe Member Professional Network')}
            </h3>
            <p className="text-xs text-teal-100 max-w-2xl mt-1 leading-relaxed">
              {t(
                'worker_coop_network_desc',
                'Collective worker governance without venture capital extraction. Equal 1-member 1-vote representation on service standards, training opportunities, fair queue allocation, and dispute arbitration.'
              )}
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-2xl font-black text-emerald-300">128</span>
            <span className="text-[10px] uppercase font-bold text-white block mt-0.5">
              {t('worker_active_certified_pros', 'Active Certified Pros')}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-slate-200/90 space-y-2 bg-white">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('worker_fair_job_dist', 'Fair Job Distribution')}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('worker_fair_job_desc', 'AI-driven queue balancing ensures new members receive equal dispatch opportunities without gig starvation.')}
          </p>
          <Badge variant="success" size="sm">{t('worker_balanced_queue_badge', '87% Balanced Queue')}</Badge>
        </Card>

        <Card className="p-5 border border-slate-200/90 space-y-2 bg-white">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-teal-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('worker_vocational_upskilling', 'Vocational Upskilling')}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('worker_upskilling_desc', 'Hands-on masterclasses in rooftop solar, micro-inverters, inverter HVAC, and modern smart home automation.')}
          </p>
          <Badge variant="coop" size="sm">{t('worker_active_programs_badge', '8 Active Programs')}</Badge>
        </Card>

        <Card className="p-5 border border-slate-200/90 space-y-2 bg-white">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('worker_verified_work_cred', 'Verified Work Credential')}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('worker_verified_cred_desc', 'Every completed service builds your tamper-proof work record, unlocking priority matching and master artisan status.')}
          </p>
          <Badge variant="warning" size="sm">{t('worker_portable_rec_badge', 'Portable Record')}</Badge>
        </Card>

        <Card className="p-5 border border-slate-200/90 space-y-2 bg-white">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Vote className="w-5 h-5 text-indigo-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">{t('worker_democratic_voice', 'Democratic Member Voice')}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('worker_democratic_voice_desc', '1 Member 1 Vote policy. Participate directly in deciding tool standards, service quality criteria, and cooperative resolutions.')}
          </p>
          <Badge variant="info" size="sm">{t('worker_1m1v_badge', '1 Member 1 Vote')}</Badge>
        </Card>
      </div>

      <Card className="p-5 border border-emerald-200 bg-emerald-50/60 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {t('worker_active_gov_poll', 'Active Governance Poll')}
            </p>
            <h3 className="text-lg font-black text-slate-900 mt-1">Commission Review Proposal</h3>
          </div>
          <Badge variant="success" size="sm">{t('worker_voting_open_badge', 'Voting Open')}</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            {t('worker_loading_poll', 'Loading current poll...')}
          </div>
        ) : poll ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-white border border-emerald-100 p-4">
              <p className="text-sm font-bold text-slate-800">{poll.question}</p>
              <p className="text-[11px] text-slate-500 mt-1">{poll.summary}</p>
            </div>

            <div className="space-y-3">
              {poll.options.map((option) => {
                const isSelected = selectedOption === option.value;
                const isDisabled = hasVoted;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !isDisabled && setSelectedOption(option.value)}
                    disabled={isDisabled}
                    className={`w-full text-left rounded-2xl border p-3 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
                    } ${isDisabled ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-800">{option.label}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            )}

            {hasVoted && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-100/60 px-3 py-2 text-xs font-medium text-emerald-800">
                Your vote has already been recorded on this active governance poll.
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <Button
                variant="coop"
                size="md"
                onClick={handleVoteSubmit}
                isLoading={isSubmitting}
                disabled={!selectedOption || isSubmitting || hasVoted}
              >
                {hasVoted ? t('worker_vote_recorded_btn', 'Vote Recorded') : t('worker_submit_vote_btn', 'Submit Vote')}
              </Button>

              <div className="text-xs text-slate-500">
                {t('worker_votes_recorded_sub', '{count} provider votes recorded').replace('{count}', poll.results?.totalVotes ?? 0)}
              </div>
            </div>

            {hasVoted && selectedOption && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-100/60 px-3 py-2 text-xs font-medium text-emerald-800">
                {t('worker_your_vote_recorded', 'Your vote is recorded:')} <span className="font-bold">{getOptionLabel(selectedOption)}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {poll.options.map((option) => (
                <div key={option.value} className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{option.label}</span>
                    <span className="font-bold text-slate-900">{poll.results?.tally?.[option.value] ?? 0}</span>
                  </div>
                  <div className="mt-2 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{
                        width: `${poll.results?.percentages?.[option.value] ?? 0}%`
                      }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    {t('worker_pct_votes', '{pct}% of votes').replace('{pct}', poll.results?.percentages?.[option.value] ?? 0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            {t('worker_no_active_poll', 'No active governance poll is currently available.')}
          </div>
        )}
      </Card>
    </div>
  );
};
