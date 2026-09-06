import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const validateEmail = (val) => {
    if (!val.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address (e.g. name@domain.com).');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessInfo(null);

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.forgotPassword(email);
      if (res.success) {
        setSuccessInfo({
          message: res.message,
          resetLink: res.resetLink
        });
      } else {
        setError(res.message || 'Unable to request password reset.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-slate to-coop-dark flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Coop<span className="text-brand-emerald">Serve</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Account Recovery</p>
            </div>
          </div>

          <div className="mb-6">
            <Badge variant="coop" size="sm" className="mb-2">Secure Recovery</Badge>
            <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the email address associated with your CoopServe account and we'll generate a reset link.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
                <div className="flex items-center gap-2 font-bold mb-1.5 text-sm text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Reset Instructions Generated
                </div>
                <p>{successInfo.message}</p>

                {successInfo.resetLink && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/80">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-1">
                      🛠️ Dev Shortcut (Test Link):
                    </p>
                    <a
                      href={successInfo.resetLink}
                      className="text-emerald-700 underline font-semibold text-xs break-all hover:text-emerald-900 block"
                    >
                      Click here to reset your password now
                    </a>
                  </div>
                )}
              </div>

              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. priya@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
                {emailError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
