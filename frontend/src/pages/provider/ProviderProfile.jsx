import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingState } from '../../components/common/LoadingState';
import {
  User,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Save,
  Star,
  Gift,
  HelpCircle,
  CheckCircle2,
  Car
} from 'lucide-react';

export const ProviderProfile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    skill: '',
    location: '',
    vehicleAvailable: false
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProviderStats();
      if (res.success && res.stats?.provider) {
        setStats(res.stats);
        setFormData({
          name: res.stats.provider.name || user?.name || '',
          phone: res.stats.provider.phone || user?.phone || '',
          skill: res.stats.provider.skill || user?.skill || '',
          location: res.stats.provider.location || user?.location || '',
          vehicleAvailable: res.stats.provider.vehicleAvailable ?? false
        });
      }
    } catch (err) {
      console.error('Error fetching provider profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProviderProfile({
        name: formData.name,
        phone: formData.phone,
        skill: formData.skill,
        location: formData.location,
        vehicleAvailable: formData.vehicleAvailable
      });
      if (res.success) {
        showToast(t('worker_profile_success_toast', 'Worker profile updated successfully!'), 'success');
        await fetchProfile();
      }
    } catch (err) {
      showToast(err.message || t('worker_profile_fail_toast', 'Failed to update worker profile'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState message={t('worker_loading_profile', 'Loading verified worker credentials...')} />;
  }

  const provider = stats?.provider || {};
  const rewards = stats?.rewards || {
    points: 0,
    tier: 'Associate Member (Bronze Tier)',
    completedJobsCount: 0,
    explanation: 'Cooperative Reward Points are calculated from your actual completed work: 10 base points per verified completed job + 1 point for every ₹50 in net earnings. New workers start with 0 points. Cancelled, failed, or refunded bookings do not earn points.'
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('worker_profile_page_title', 'Worker Profile & Verified Credentials')}
        description={t(
          'worker_profile_page_desc',
          'Your official cooperative technician card, trade certifications, portable Trust Score, and live rewards ledger.'
        )}
        breadcrumbs={[t('nav_dashboard', 'Home'), t('worker_menu_profile', 'Profile')]}
        badge={
          <Badge variant={provider.isVerified ? 'success' : 'info'} size="sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {provider.isVerified ? t('worker_verified_badge', 'Verified Technician') : t('worker_coop_member_badge', 'Cooperative Member')}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Worker Badge & Rewards Cards */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6 text-center space-y-4 bg-white">
            <Avatar
              src={provider.avatar}
              name={provider.name || 'Worker'}
              size="xl"
              isVerified={Boolean(provider.isVerified)}
              className="mx-auto"
            />
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">{formData.name || provider.name || 'Coop Pro'}</h3>
              <p className="text-xs font-bold text-emerald-800">{formData.skill || provider.skill || 'Technician'}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                <Badge variant="coop" size="sm">
                  {provider.coopMemberId || provider.workerId || provider.id}
                </Badge>
                <Badge variant="protected" size="sm">
                  {t('worker_badge_protected', '90% Direct Payout')}
                </Badge>
              </div>
            </div>

            {/* Trust Telemetry Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-emerald-50 border border-indigo-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">{t('worker_stat_trust_score', 'CoopServe Trust Score')}</span>
                <span className="text-base font-black text-indigo-700">
                  {provider.trustScore || 85}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{t('worker_stat_rating', 'Rating')}</span>
                <span className="font-bold text-amber-600">
                  {provider.rating > 0 ? `${Number(provider.rating).toFixed(2)} ⭐` : t('worker_no_reviews_yet', '0.0 (No reviews)')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{t('worker_stat_completed_jobs', 'Completed Jobs')}</span>
                <span className="font-bold text-emerald-700">{provider.jobsCompleted ?? 0}</span>
              </div>
              <p className="text-[11px] text-indigo-800/80 leading-relaxed pt-1 border-t border-indigo-100/60">
                {t('worker_vehicle_available_label', 'Vehicle available')}: {formData.vehicleAvailable ? t('worker_yes', 'Yes') : t('worker_no', 'No')}
              </p>
            </div>
          </Card>

          {/* Cooperative Rewards Box */}
          <Card className="p-5 bg-gradient-to-br from-emerald-900 to-teal-900 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {t('worker_rewards_title', 'Worker Rewards')}
                </span>
              </div>
              <Badge variant="success" size="sm">
                {rewards.tier}
              </Badge>
            </div>

            <div>
              <div className="text-3xl font-black text-emerald-300">
                {rewards.points} <span className="text-xs font-bold text-white uppercase tracking-wider">{t('worker_points_suffix', 'Points')}</span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-1">
                {t('worker_rewards_calc_desc', '{count} verified completed jobs').replace('{count}', rewards.completedJobsCount)}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[11px] text-emerald-100 leading-relaxed">
              <div className="flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                <span>
                  <strong>{t('worker_calc_formula_title', 'Calculation Formula:')}</strong> {rewards.explanation}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (8 cols): Edit Form */}
        <div className="lg:col-span-8">
          <Card className="p-6 bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {t('worker_prof_details_title', 'Professional Details')}
              </h3>
              <span className="text-xs text-slate-400">ID: {provider.workerId || provider.id}</span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label={t('worker_full_name', 'Full Name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('worker_primary_trade', 'Primary Trade & Specialization')}
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  leftIcon={<Award className="w-4 h-4" />}
                  required
                />
                <Input
                  label={t('worker_contact_phone', 'Contact Phone Number')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />
              </div>

              <Input
                label={t('worker_base_location', 'Primary Base Location')}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vehicleAvailable}
                    onChange={(e) => setFormData({ ...formData, vehicleAvailable: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <span>{t('worker_vehicle_checkbox', 'Vehicle available for instant on-site service dispatches')}</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  {t('worker_save_changes_btn', 'Save Profile Changes')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
