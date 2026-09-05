import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  Zap
} from 'lucide-react';

export const Login = () => {
  const { login, demoLogin, isLoading } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Story & Differentiators */}
        <div className="lg:col-span-6 text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Coop<span className="text-emerald-400">Serve</span></h1>
              <p className="text-xs text-emerald-300 font-medium">Cooperative Gig Platform</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Trusted Local Services. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Fair Opportunities.
              </span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              CoopServe replaces predatory gig aggregators with a cooperative model. Transparent fees, AI-powered fair matching, Protected Bookings, and verified worker reputation.
            </p>
          </div>

          {/* Quick Pillar Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 88% Worker Share
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">Transparent fee breakdown on every booking.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <p className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Protected Booking
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">Insurance pool & verified service records.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & 1-Click Demo Logins */}
        <div className="lg:col-span-6">
          <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-lg p-6 sm:p-8">
            <div className="mb-6">
              <Badge variant="coop" size="sm" className="mb-2">Enterprise Cooperative Platform</Badge>
              <h3 className="text-xl font-bold text-slate-900">Sign in to CoopServe</h3>
              <p className="text-xs text-slate-500 mt-1">Sign in with your credentials or select a role</p>
            </div>

            {/* Quick Role Selection */}
            <div className="space-y-2 mb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Role Access
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoClick('CUSTOMER', '/customer/dashboard')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/90 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <UserCheck className="w-3.5 h-3.5" /> Customer
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-0.5 truncate">Ananya Sharma</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('SERVICE_PROVIDER', '/provider/dashboard')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/90 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-1.5 text-teal-800 font-bold text-xs">
                    <Wrench className="w-3.5 h-3.5" /> Worker
                  </div>
                  <p className="text-[10px] text-teal-700 mt-0.5 truncate">Rahul (Electrician)</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('ADMIN', '/admin/dashboard')}
                  disabled={isLoading}
                  className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/90 text-left transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5" /> Admin
                  </div>
                  <p className="text-[10px] text-rose-700 mt-0.5 truncate">Co-op Manager</p>
                </button>
              </div>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or enter credentials</span></div>
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

              <Input
                label="Password"
                type="password"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

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

            <div className="mt-5 text-center text-xs text-slate-500">
              New to CoopServe?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
                Create new account
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
