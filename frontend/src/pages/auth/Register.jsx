import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Wrench,
  ArrowRight,
  Users,
  Sparkles,
  Percent,
  Shield,
  CheckCircle2,
  Glasses,
  LocateFixed,
  Heart,
  ChevronDown
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:\+91|91)?[6-9]\d{9}$/;

const SKILL_OPTIONS = [
  { value: 'Electrician',    label: 'Electrician & Home Wiring' },
  { value: 'Plumber',        label: 'Plumbing & Pipe Repair' },
  { value: 'House Cleaner',  label: 'Deep Cleaning & Sanitization' },
  { value: 'Gardener',       label: 'Gardening & Plant Care' },
  { value: 'Carpenter',      label: 'Carpentry & Furniture Making' },
  { value: 'Painter',        label: 'Painting & Waterproofing' },
  { value: 'Appliance Tech', label: 'Appliance & AC Repair' },
  { value: 'Other',          label: 'Other (specify below)' },
];

// ---------------------------------------------------------------------------
// Password strength helper
// ---------------------------------------------------------------------------
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[a-zA-Z]/.test(pw))     score++;
  if (/\d/.test(pw))           score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-rose-500'   };
  if (score === 2) return { score, label: 'Fair',   color: 'bg-amber-500'  };
  if (score === 3) return { score, label: 'Good',   color: 'bg-teal-500'   };
  return              { score, label: 'Strong', color: 'bg-emerald-500' };
}

// ---------------------------------------------------------------------------
// Inline Error pill
// ---------------------------------------------------------------------------
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
      <span className="inline-block w-1 h-1 rounded-full bg-rose-500 shrink-0" />
      {msg}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Native select wrapper matching the design system
// ---------------------------------------------------------------------------
function NativeSelect({ label, value, onChange, options, disabled, helperText, id }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>
      {helperText && <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export const Register = () => {
  const { register, isLoading } = useAuth();
  const { isElderlyMode, toggleAccessibilityMode } = useAccessibility();
  const navigate = useNavigate();

  // ── Form state ────────────────────────────────────────────────────────────
  const [role, setRole] = useState('CUSTOMER');
  const [form, setForm] = useState({
    name:          '',
    email:         '',
    phone:         '',
    password:      '',
    state:         'Maharashtra',
    city:          'Pune',
    neighbourhood: '',
    lat:           null,
    lng:           null,
    skill:         'Electrician',
    customSkill:   '',
    trustedName:   '',
    trustedPhone:  '',
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [errors,         setErrors]         = useState({});
  const [globalError,    setGlobalError]    = useState('');
  const [geoStatus,      setGeoStatus]      = useState('idle'); // idle | loading | ok | error
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [locLoading,     setLocLoading]     = useState(true);

  // ── Fetch location data ───────────────────────────────────────────────────
  useEffect(() => {
    api.getLocations()
      .then((data) => {
        if (data?.locations) {
          const mh   = data.locations.find((l) => l.state === 'Maharashtra');
          const pune = mh?.cities?.find((c) => c.city === 'Pune');
          if (pune?.neighbourhoods?.length) {
            const hoods = pune.neighbourhoods;
            setNeighbourhoods(hoods);
            setForm((f) => ({ ...f, neighbourhood: hoods[0] }));
          }
        }
      })
      .catch(() => {
        const fallback = ['Kothrud','Shivajinagar','Aundh','Baner','Hadapsar','Wanowrie','Pimpri','Chinchwad','Wakad','Hinjawadi','Koregaon Park','Viman Nagar','Kharadi','Magarpatta','Deccan'];
        setNeighbourhoods(fallback);
        setForm((f) => ({ ...f, neighbourhood: fallback[0] }));
      })
      .finally(() => setLocLoading(false));
  }, []);

  // ── Field updater ─────────────────────────────────────────────────────────
  const set = useCallback((field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((errs) => ({ ...errs, [field]: '' }));
  }, []);

  // ── Geolocation ───────────────────────────────────────────────────────────
  const captureLocation = () => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setGeoStatus('ok');
      },
      () => setGeoStatus('error'),
      { timeout: 8000 }
    );
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const pwStrength = getPasswordStrength(form.password);

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())                                         errs.name          = 'Full name is required.';
    if (!form.email.trim())                                        errs.email         = 'Email address is required.';
    else if (!EMAIL_RE.test(form.email))                           errs.email         = 'Enter a valid email address.';
    if (!form.phone.trim())                                        errs.phone         = 'Phone number is required.';
    else if (!PHONE_RE.test(form.phone.replace(/\s/g, '')))       errs.phone         = 'Enter a valid Indian mobile number (e.g. 9876543210).';
    if (!form.password)                                            errs.password      = 'Password is required.';
    else if (form.password.length < 8)                             errs.password      = 'Password must be at least 8 characters.';
    else if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password))
                                                                   errs.password      = 'Password must contain at least one letter and one number.';
    if (!form.neighbourhood)                                       errs.neighbourhood = 'Please select a neighbourhood.';
    if (role === 'SERVICE_PROVIDER' && form.skill === 'Other' && !form.customSkill.trim())
                                                                   errs.customSkill   = 'Please specify your trade/skill.';
    if (isElderlyMode && form.trustedPhone && !PHONE_RE.test(form.trustedPhone.replace(/\s/g, '')))
                                                                   errs.trustedPhone  = 'Enter a valid Indian mobile number.';
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      name:          form.name.trim(),
      email:         form.email.trim(),
      phone:         form.phone.trim(),
      password:      form.password,
      role,
      state:         form.state,
      city:          form.city,
      neighbourhood: form.neighbourhood,
      ...(form.lat !== null && { lat: form.lat }),
      ...(form.lng !== null && { lng: form.lng }),
      ...(role === 'SERVICE_PROVIDER' && {
        skill: form.skill,
        ...(form.skill === 'Other' && { customSkill: form.customSkill.trim() }),
      }),
      ...(isElderlyMode && (form.trustedName || form.trustedPhone) && {
        trustedContact: { name: form.trustedName.trim(), phone: form.trustedPhone.trim() },
      }),
    };

    const res = await register(payload);
    if (res.success) {
      if (res.user.role === 'SERVICE_PROVIDER') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } else {
      setGlobalError(res.message || 'Registration failed. Please try again.');
    }
  };

  const hoodOptions = neighbourhoods.map((h) => ({ value: h, label: h }));

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-slate to-coop-dark flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">

        {/* ── Left Panel: Hero / Brand (~58%) ─────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Brand header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  Coop<span className="text-emerald-400">Serve</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Cooperative
                  </span>
                </h1>
                <p className="text-xs text-slate-300 font-medium">Gig Services Platform</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                Join the<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">
                  cooperative.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                CoopServe is Pune's first democratic gig cooperative — co-governed by the very workers and customers it serves. Earn fair wages, build verified trust, and access genuine livelihood protection.
              </p>
            </div>

            {/* 4 pillars */}
            <div className="space-y-3 pt-2">
              {[
                { icon: Users,    bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', title: 'Cooperative-owned, not corporate',   body: 'Members vote on fee rules, dividend allocations, and trust standards democratically.' },
                { icon: Sparkles, bg: 'bg-teal-500/20',    border: 'border-teal-500/30',    text: 'text-teal-400',    title: 'AI-matched in seconds',               body: 'Intelligent proximity and reputation routing — no predatory surge pricing or locks.' },
                { icon: Percent,  bg: 'bg-cyan-500/20',    border: 'border-cyan-500/30',    text: 'text-cyan-400',    title: 'Transparent 90/10 earnings split',    body: '90% net take-home to local workers on every job; 10% overhead, zero hidden deductions.' },
                { icon: Shield,   bg: 'bg-amber-500/20',   border: 'border-amber-500/30',   text: 'text-amber-400',   title: 'Verified & insured workers',           body: 'Every booking includes cooperative insurance, skill badges, and real community feedback.' },
              ].map(({ icon: Icon, bg, border, text, title, body }) => (
                <div key={title} className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                  <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center ${text} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom metrics */}
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

        {/* ── Right Panel: Registration Card (~42%) ────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl relative">

            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-5">
              <div>
                <Badge variant="coop" size="sm" className="mb-1.5">New Member</Badge>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-xs text-slate-500 mt-0.5">Join the cooperative in under 2 minutes</p>
              </div>
              <button
                id="reg-ez-toggle"
                type="button"
                onClick={toggleAccessibilityMode}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all shrink-0 ${
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

            {/* Global error */}
            {globalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {globalError}
              </div>
            )}

            <form id="register-form" onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">I am a…</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    id="role-customer"
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      role === 'CUSTOMER' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏠 Household Customer
                  </button>
                  <button
                    id="role-provider"
                    type="button"
                    onClick={() => setRole('SERVICE_PROVIDER')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      role === 'SERVICE_PROVIDER' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ Service Worker / Pro
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <Input
                  id="reg-name"
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={set('name')}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <FieldError msg={errors.name} />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Input
                    id="reg-email"
                    label="Email Address"
                    type="email"
                    placeholder="priya@example.com"
                    value={form.email}
                    onChange={set('email')}
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                  <FieldError msg={errors.email} />
                </div>
                <div>
                  <Input
                    id="reg-phone"
                    label="Mobile Number"
                    type="tel"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={set('phone')}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                  <FieldError msg={errors.phone} />
                </div>
              </div>

              {/* Password + strength meter */}
              <div>
                <Input
                  id="reg-password"
                  label="Password"
                  type="password"
                  placeholder="Min 8 chars, 1 letter, 1 number"
                  value={form.password}
                  onChange={set('password')}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                {form.password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`}
                        style={{ width: `${(pwStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-[11px] font-bold ${
                      pwStrength.score <= 1 ? 'text-rose-500'
                      : pwStrength.score === 2 ? 'text-amber-500'
                      : pwStrength.score === 3 ? 'text-teal-600'
                      : 'text-emerald-600'
                    }`}>{pwStrength.label}</span>
                  </div>
                )}
                <FieldError msg={errors.password} />
              </div>

              {/* Location */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Service Location
                  </span>
                  <button
                    id="geo-capture-btn"
                    type="button"
                    onClick={captureLocation}
                    disabled={geoStatus === 'loading'}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition-all ${
                      geoStatus === 'ok'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : geoStatus === 'error'
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <LocateFixed className="w-3 h-3" />
                    {geoStatus === 'loading' ? 'Locating…'
                      : geoStatus === 'ok'    ? 'GPS Captured ✓'
                      : geoStatus === 'error' ? 'GPS Unavailable'
                      : 'Use my location'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NativeSelect id="reg-state" label="State" value={form.state} onChange={set('state')}
                    options={[{ value: 'Maharashtra', label: 'Maharashtra' }]} disabled />
                  <NativeSelect id="reg-city" label="City" value={form.city} onChange={set('city')}
                    options={[{ value: 'Pune', label: 'Pune' }]} disabled />
                </div>
                <div>
                  <NativeSelect
                    id="reg-neighbourhood"
                    label="Neighbourhood"
                    value={form.neighbourhood}
                    onChange={set('neighbourhood')}
                    options={locLoading ? [{ value: '', label: 'Loading…' }] : hoodOptions}
                    disabled={locLoading || hoodOptions.length === 0}
                  />
                  <FieldError msg={errors.neighbourhood} />
                </div>
              </div>

              {/* Skill (SERVICE_PROVIDER only) */}
              {role === 'SERVICE_PROVIDER' && (
                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3 animate-in fade-in duration-200">
                  <NativeSelect
                    id="reg-skill"
                    label="Primary Trade / Skill"
                    value={form.skill}
                    onChange={set('skill')}
                    options={SKILL_OPTIONS}
                    helperText="You will be registered in the CoopServe Provider Cooperative Network"
                  />
                  {form.skill === 'Other' && (
                    <div className="animate-in fade-in duration-150">
                      <Input
                        id="reg-custom-skill"
                        label="Specify Your Skill"
                        type="text"
                        placeholder="e.g. Solar Panel Installer"
                        value={form.customSkill}
                        onChange={set('customSkill')}
                        leftIcon={<Wrench className="w-4 h-4" />}
                      />
                      <FieldError msg={errors.customSkill} />
                    </div>
                  )}
                </div>
              )}

              {/* Trusted Contact (Elderly EZ Mode) */}
              {isElderlyMode && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Trusted Contact <span className="font-normal text-amber-700">(Optional)</span></p>
                      <p className="text-[11px] text-amber-700">Someone we can contact on your behalf if needed.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      id="reg-trusted-name"
                      label="Contact Name"
                      type="text"
                      placeholder="e.g. Rakesh Sharma"
                      value={form.trustedName}
                      onChange={set('trustedName')}
                      leftIcon={<User className="w-4 h-4" />}
                    />
                    <div>
                      <Input
                        id="reg-trusted-phone"
                        label="Contact Phone"
                        type="tel"
                        placeholder="9876543210"
                        value={form.trustedPhone}
                        onChange={set('trustedPhone')}
                        leftIcon={<Phone className="w-4 h-4" />}
                      />
                      <FieldError msg={errors.trustedPhone} />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                id="reg-submit-btn"
                type="submit"
                variant="coop"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Complete Registration & Join
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
                Sign In
              </Link>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

