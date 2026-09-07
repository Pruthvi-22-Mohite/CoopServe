import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Sparkles,
  Users,
  Percent,
  CheckCircle2
} from 'lucide-react';

export const Login = () => {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      if (res.user.role === 'SERVICE_PROVIDER') navigate('/provider/dashboard');
      else if (res.user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/customer/dashboard');
    } else {
      setError(res.message || t('auth_login_failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-slate to-coop-dark flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">

        {/* Left Panel: Asymmetric Rich Hero Section (~58% Width) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow Shapes */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  Coop<span className="text-brand-emerald">Serve</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {t('auth_cooperative')}
                  </span>
                </h1>
                <p className="text-xs text-slate-300 font-medium">{t('auth_platform_tagline')}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                {t('auth_fair_work')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">
                  {t('auth_direct_livelihoods')}
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                {t('auth_hero_description')}
              </p>
            </div>

            {/* Structured Feature List (4 Verified Pillars) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('auth_feature_cooperative')}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{t('auth_feature_cooperative_text')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('auth_feature_ai')}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{t('auth_feature_ai_text')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('auth_feature_earnings')}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{t('auth_feature_earnings_text')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('auth_feature_verified')}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">{t('auth_feature_verified_text')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Metrics */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t('auth_certified_professionals')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">{t('auth_payment_enabled')}</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Compact, High-Impact Sign-In Card (~42% Width) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl relative">

            {/* Header with Title */}
            <div className="mb-5">
              <Badge variant="coop" size="sm" className="mb-1.5">{t('auth_cooperative')}</Badge>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('auth_sign_in')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('auth_new_member')}</p>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-white/95 px-2 text-slate-400 font-semibold tracking-wider">{t('auth_enter_credentials')}</span></div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label={t('auth_email')}
                type="email"
                placeholder={t('auth_email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    {t('auth_password')}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-brand-emerald hover:text-emerald-700 hover:underline"
                  >
                    {t('auth_forgot_password')}
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t('auth_sign_in_button')}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 text-center text-xs text-slate-500">
              <div>
                {t('auth_new_member')}{' '}
                <Link to="/register" className="font-bold text-brand-emerald hover:text-emerald-700 underline">
                  {t('auth_create_account')}
                </Link>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {t('auth_admin_login')}
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
