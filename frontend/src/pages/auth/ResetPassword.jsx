import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 'None', score: 0, text: '', color: 'bg-slate-200' };
    const hasMinLength = pwd.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLong = pwd.length >= 10;

    if (!hasMinLength || !hasLetter || !hasNumber) {
      return { level: 'Weak', score: 1, text: 'Must be 8+ chars with a letter & number', color: 'bg-rose-500' };
    }
    if (hasMinLength && hasLetter && hasNumber && (hasSpecial || isLong)) {
      return { level: 'Strong', score: 3, text: 'Strong password', color: 'bg-emerald-500' };
    }
    return { level: 'Medium', score: 2, text: 'Good (add special characters for Strong)', color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength(password);

  const validatePassword = (pwd) => {
    if (!pwd) {
      setPasswordError('Password is required.');
      return false;
    }
    if (pwd.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return false;
    }
    if (!/[a-zA-Z]/.test(pwd)) {
      setPasswordError('Password must contain at least one letter.');
      return false;
    }
    if (!/\d/.test(pwd)) {
      setPasswordError('Password must contain at least one number.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirm = (pwd, confirm) => {
    if (!confirm) {
      setConfirmError('Please confirm your new password.');
      return false;
    }
    if (pwd !== confirm) {
      setConfirmError('Passwords do not match.');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the URL.');
      return;
    }

    const isPwdValid = validatePassword(password);
    const isConfValid = validateConfirm(password, confirmPassword);
    if (!isPwdValid || !isConfValid) return;

    setIsLoading(true);
    try {
      const res = await api.resetPassword(token, password);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setError(res.message || 'Failed to reset password.');
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
              <p className="text-xs text-slate-500 font-medium">Password Reset</p>
            </div>
          </div>

          {!token && !isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Invalid or missing reset token in link. Please request a new password reset link.</span>
              </div>
              <Link
                to="/forgot-password"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Request New Link
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Password Reset Complete!</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your password has been successfully updated. You can now sign in with your new credentials.
                </p>
              </div>
              <Button
                variant="primary"
                className="w-full mt-2"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In with New Password
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Badge variant="coop" size="sm" className="mb-2">New Password</Badge>
                <h2 className="text-xl font-bold text-slate-900">Choose a new password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create a secure password with at least 8 characters, including a letter and a number.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) validatePassword(e.target.value);
                      if (confirmPassword) validateConfirm(e.target.value, confirmPassword);
                    }}
                    onBlur={() => validatePassword(password)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Strength:</span>
                        <span className={`font-bold ${
                          strength.level === 'Strong'
                            ? 'text-emerald-600'
                            : strength.level === 'Medium'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}>
                          {strength.level}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`h-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                        <div className={`h-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                      </div>
                      <p className="text-[10px] text-slate-400">{strength.text}</p>
                    </div>
                  )}
                  {passwordError && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{passwordError}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) validateConfirm(password, e.target.value);
                    }}
                    onBlur={() => validateConfirm(password, confirmPassword)}
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />
                  {confirmError && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{confirmError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Update Password
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
