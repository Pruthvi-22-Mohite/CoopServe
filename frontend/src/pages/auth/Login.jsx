import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  Wrench,
  Shield,
  Sparkles,
  Zap,
  Users,
  Percent,
  CheckCircle2,
  Glasses
} from 'lucide-react';

export const Login = () => {
  const { login, demoLogin, isLoading } = useAuth();
  const { isElderlyMode, toggleAccessibilityMode } = useAccessibility();
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
      setError(res.message || 'Login failed');
    }
  };

  const handleDemoClick = async (role, destination) => {
    const res = await demoLogin(role, true);
    if (res.success) {
      navigate(destination);
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
                    Cooperative
                  </span>
                </h1>
                <p className="text-xs text-slate-300 font-medium">Gig Services Platform</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                Fair work. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">
                  Direct livelihoods.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                CoopServe replaces exploitative gig algorithms with democratic cooperative ownership. Certified service professionals receive fair wages, and customers get guaranteed quality with Protected Bookings.
              </p>
            </div>

            {/* Structured Feature List (4 Verified Pillars) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cooperative-owned, not corporate</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Members co-govern fee rules, dividend allocations, and trust standards democratically.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI-matched in seconds</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Intelligent proximity and reputation routing without predatory surge pricing or penalty locks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Transparent 90/10 earnings split</h3>
                  <p className="text-xs text-slate-300 mt-0.5">90% net take-home to local workers on every job; 10% operational overhead with zero hidden deductions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Verified & insured workers</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Every booking includes cooperative insurance protection, skill badges, and real community feedback.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Metrics */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>128 Certified Co-op Professionals in Pune</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Protected Escrow & UPI Enabled</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Compact, High-Impact Sign-In Card (~42% Width) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl relative">
            
            {/* Header with Title and Mode Indicator */}
            <div className="flex items-start justify-between gap-2 mb-5">
              <div>
                <Badge variant="coop" size="sm" className="mb-1.5">Member Portal</Badge>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h2>
                <p className="text-xs text-slate-500 mt-0.5">Access your dashboard or use 1-click demo roles</p>
              </div>

              {/* Elderly EZ Mode Quick Toggle */}
              <button
                type="button"
                onClick={toggleAccessibilityMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                  isElderlyMode
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Toggle larger fonts, bigger buttons, and simplified layout"
              >
                <Glasses className={`w-3.5 h-3.5 ${isElderlyMode ? 'text-amber-700' : 'text-slate-500'}`} />
                <span>{isElderlyMode ? 'EZ Mode ON' : 'EZ Mode'}</span>
              </button>
            </div>

            {/* 1-Click Demo Logins */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Role Access
                </span>
                <span className="text-[10px] text-slate-400 font-normal">No password needed</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoClick('CUSTOMER', '/customer/dashboard')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/90 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Customer</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-0.5 truncate">Ananya S.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('SERVICE_PROVIDER', '/provider/dashboard')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/90 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1 text-teal-800 font-bold text-xs">
                    <Wrench className="w-3.5 h-3.5 shrink-0" />
                    <span>Worker</span>
                  </div>
                  <p className="text-[10px] text-teal-700 mt-0.5 truncate">Rahul S.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('ADMIN', '/admin/dashboard')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/90 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-1 text-rose-800 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin</span>
                  </div>
                  <p className="text-[10px] text-rose-700 mt-0.5 truncate">Operations</p>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-[11px] uppercase"><span className="bg-white/95 px-2 text-slate-400 font-semibold tracking-wider">Or enter credentials</span></div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label="Email Address"
                type="email"
                placeholder="customer@coopserve.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-brand-emerald hover:text-emerald-700 hover:underline"
                  >
                    Forgot password?
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
                Sign In to Platform
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              New to CoopServe?{' '}
              <Link to="/register" className="font-bold text-brand-emerald hover:text-emerald-700 underline">
                Create new account
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
