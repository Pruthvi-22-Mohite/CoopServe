import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertTriangle,
  Building2,
  KeyRound
} from 'lucide-react';

export const AdminLogin = () => {
  const { adminLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await adminLogin(email, password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">

        {/* Left Panel */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 rounded-3xl bg-slate-800/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-slate-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-700 to-rose-500 flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-7 h-7 stroke-[2]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  CoopServe <span className="text-rose-400">Admin</span>
                </h1>
                <p className="text-xs text-slate-300 font-medium">Cooperative Regulatory and Administrative Portal</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Restricted{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">
                  Administrator
                </span>{' '}
                Access
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                This portal is exclusively reserved for authorised CoopServe administrators and regulatory officers. Unauthorised access attempts are logged and monitored.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-300">Role-verified authentication required</span>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-300">Admin credentials only - no customer access</span>
              </div>
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-slate-500/20 border border-slate-500/30 flex items-center justify-center text-slate-400 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-300">All sessions are audited and monitored</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-xs text-slate-500">
            Cooperative Regulatory and Administrative Portal v2.0 - Authorised Use Only
          </div>
        </div>

        {/* Right Panel: Sign-In Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl relative">
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-200 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Administrator Portal
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Sign In</h2>
              <p className="text-xs text-slate-500 mt-0.5">Authorised administrators only</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label="Administrator Email"
                type="email"
                placeholder="admin@coopserve.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="danger"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Authenticate as Administrator
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Not an administrator?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
                Go to Member Portal
              </Link>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
