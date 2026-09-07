import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t } = useLanguage();
  const navigate = useNavigate();

  // ── Form state ────────────────────────────────────────────────────────────
  const [role, setRole] = useState('CUSTOMER');
  const [form, setForm] = useState({
    name:          '',
    email:         '',
    phone:         '',
    password:      '',
    state:         '',
    city:          '',
    neighbourhood: '',
    lat:           null,
    lng:           null,
    skill:         'Electrician',
    customSkill:   '',
    vehicleAvailable: false,
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [errors,         setErrors]         = useState({});
  const [globalError,    setGlobalError]    = useState('');
  const [geoStatus,      setGeoStatus]      = useState('idle'); // idle | loading | ok | error
  const [locationSource, setLocationSource] = useState('manual');
  const [manualArea,     setManualArea]     = useState('');
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [locationCatalog, setLocationCatalog] = useState(null);
  const [locLoading,     setLocLoading]     = useState(true);

  // ── Fetch location data ───────────────────────────────────────────────────
  useEffect(() => {
    api.getLocations()
      .then((data) => {
        if (data?.locations) {
          setLocationCatalog(data.locations);
          const defaultState = data.locations.states?.find((item) => item.enabled)?.name || '';
          const defaultCity = defaultState
            ? data.locations.cities?.[data.locations.states?.find((item) => item.name === defaultState)?.code]?.find((item) => item.enabled)?.name || ''
            : '';
          const defaultCityId = defaultCity ? defaultCity.toLowerCase().replace(/\s+/g, '_') : '';
          setNeighbourhoods(data.locations.neighbourhoods?.[defaultCityId] || []);
        }
      })
      .catch(() => {
        setNeighbourhoods([]);
      })
      .finally(() => setLocLoading(false));
  }, []);

  // ── Field updater ─────────────────────────────────────────────────────────
  const set = useCallback((field) => (e) => {
    const val = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((errs) => ({ ...errs, [field]: '' }));
  }, []);

  const locationStates = locationCatalog?.states?.filter((item) => item.enabled) || [];
  const selectedStateCode = locationStates.find((item) => item.name === form.state)?.code;
  const locationCities = selectedStateCode
    ? locationCatalog?.cities?.[selectedStateCode]?.filter((item) => item.enabled) || []
    : [];

  // ── Geolocation ───────────────────────────────────────────────────────────
  const captureLocation = () => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' }
          });
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error(`Reverse geocoding failed: ${response.status}`);
          const data = await response.json();
          const address = data.address || {};
          const resolvedState = address.state || '';
          const resolvedCity = address.city || address.town || address.municipality || address.village || address.state_district || '';
          const resolvedArea = address.suburb || address.neighbourhood || address.city_district || address.residential || address.quarter || address.county || '';
          if (!resolvedState || !resolvedCity || !resolvedArea) throw new Error('General location unavailable');
          setForm((f) => ({ ...f, state: resolvedState, city: resolvedCity, neighbourhood: resolvedArea, lat: latitude, lng: longitude }));
          setManualArea('');
          setLocationSource('gps');
          setGeoStatus('ok');
        } catch {
          setGeoStatus('error');
        }
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
    if (!form.name.trim())                                         errs.name          = t('validation_full_name_required');
    if (!form.email.trim())                                        errs.email         = t('validation_email_required');
    else if (!EMAIL_RE.test(form.email))                           errs.email         = t('validation_email_invalid');
    if (!form.phone.trim())                                        errs.phone         = t('validation_phone_required');
    else if (!PHONE_RE.test(form.phone.replace(/\s/g, '')))       errs.phone         = t('validation_phone_invalid');
    if (!form.password)                                            errs.password      = t('validation_password_required');
    else if (form.password.length < 8)                             errs.password      = t('validation_password_length');
    else if (!/[a-zA-Z]/.test(form.password) || !/\d/.test(form.password))
                                                                   errs.password      = t('validation_password_requirements');
    if (!(form.neighbourhood && form.neighbourhood !== '__manual__') && !manualArea.trim()) errs.neighbourhood = t('validation_neighbourhood_required');
      if (!form.state || !form.city.trim() || (!(form.neighbourhood && form.neighbourhood !== '__manual__') && !manualArea.trim())) errs.neighbourhood = t('validation_location_required');
    if (role === 'SERVICE_PROVIDER' && form.skill === 'Other' && !form.customSkill.trim())
                                                                   errs.customSkill   = t('validation_skill_required');
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const selectedArea = form.neighbourhood === '__manual__' ? manualArea.trim() : form.neighbourhood;
    let resolvedLat = form.lat;
    let resolvedLng = form.lng;
    if (role === 'CUSTOMER' && (!Number.isFinite(resolvedLat) || !Number.isFinite(resolvedLng))) {
      try {
        const query = encodeURIComponent([selectedArea, form.city, form.state].filter(Boolean).join(', '));
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, {
          headers: { Accept: 'application/json' }
        });
        const results = await response.json();
        if (results[0]) {
          resolvedLat = Number(results[0].lat);
          resolvedLng = Number(results[0].lon);
        }
      } catch {
        // The account can still be created; booking will request a resolvable service location.
      }
    }

    const payload = {
      name:          form.name.trim(),
      email:         form.email.trim(),
      phone:         form.phone.trim(),
      password:      form.password,
      role,
      state:         form.state,
      city:          form.city,
      neighbourhood: selectedArea,
      ...(Number.isFinite(resolvedLat) && { lat: resolvedLat }),
      ...(Number.isFinite(resolvedLng) && { lng: resolvedLng }),
      ...(role === 'SERVICE_PROVIDER' && {
        skill: form.skill,
        vehicleAvailable: form.vehicleAvailable,
        ...(form.skill === 'Other' && { customSkill: form.customSkill.trim() }),
      }),
    };

    const res = await register(payload);
    if (res.success) {
      if (res.user.role === 'SERVICE_PROVIDER') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } else {
      setGlobalError(res.message || t('auth_registration_failed'));
    }
  };

  const hoodOptions = [
    ...neighbourhoods.map((h) => ({ value: h, label: h })),
    ...(form.neighbourhood && form.neighbourhood !== '__manual__' && !neighbourhoods.includes(form.neighbourhood)
      ? [{ value: form.neighbourhood, label: form.neighbourhood }]
      : [])
  ];

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
                    {t('auth_cooperative')}
                  </span>
                </h1>
                <p className="text-xs text-slate-300 font-medium">{t('auth_platform_tagline')}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
                {t('auth_join_cooperative')}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">
                  {t('auth_cooperative')}.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                {t('auth_hero_description')}
              </p>
            </div>

            {/* 4 pillars */}
            <div className="space-y-3 pt-2">
              {[
                { icon: Users,    bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', title: t('auth_feature_cooperative'), body: t('auth_feature_cooperative_text') },
                { icon: Sparkles, bg: 'bg-teal-500/20',    border: 'border-teal-500/30',    text: 'text-teal-400',    title: t('auth_feature_ai'), body: t('auth_feature_ai_text') },
                { icon: Percent,  bg: 'bg-cyan-500/20',    border: 'border-cyan-500/30',    text: 'text-cyan-400',    title: t('auth_feature_earnings'), body: t('auth_feature_earnings_text') },
                { icon: Shield,   bg: 'bg-amber-500/20',   border: 'border-amber-500/30',   text: 'text-amber-400',   title: t('auth_feature_verified'), body: t('auth_feature_verified_text') },
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
              <span>{t('auth_certified_professionals')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">{t('auth_payment_enabled')}</span>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Registration Card (~42%) ────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl relative">

            {/* Header row */}
            <div className="mb-5">
              <Badge variant="coop" size="sm" className="mb-1.5">{t('auth_new_member')}</Badge>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('auth_create_account_title')}</h2>
              {role === 'CUSTOMER' && <p className="text-xs text-slate-500 mt-0.5">{t('auth_registration_subtitle')}</p>}
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">{t('auth_role_prompt')}</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    id="role-customer"
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      role === 'CUSTOMER' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🏠 {t('auth_customer_role')}
                  </button>
                  <button
                    id="role-provider"
                    type="button"
                    onClick={() => {
                      setRole('SERVICE_PROVIDER');
                      setNeighbourhoods([]);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      role === 'SERVICE_PROVIDER' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ {t('auth_provider_role')}
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <Input
                  id="reg-name"
                  label={t('auth_full_name')}
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
                    label={t('auth_email')}
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
                    label={t('auth_mobile')}
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
                  label={t('auth_password')}
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
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {t('auth_service_location')}
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
                    {geoStatus === 'loading' ? t('auth_locating')
                      : geoStatus === 'ok'    ? t('auth_gps_captured')
                      : geoStatus === 'error' ? t('auth_gps_unavailable')
                      : t('auth_use_location')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NativeSelect id="reg-state" label={t('auth_state')} value={form.state} onChange={(event) => { setLocationSource('manual'); setForm((current) => ({ ...current, state: event.target.value, city: '', neighbourhood: '', lat: null, lng: null })); }}
                    options={[{ value: '', label: t('auth_select_state') }, ...locationStates.map((item) => ({ value: item.name, label: item.name }))]} />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">{t('auth_city')}</label>
                    {locationCities.length > 0 ? (
                      <NativeSelect id="reg-city" value={form.city} onChange={(event) => { setLocationSource('manual'); const city = event.target.value; setForm((current) => ({ ...current, city, neighbourhood: '', lat: null, lng: null })); setNeighbourhoods(locationCatalog?.neighbourhoods?.[locationCities.find((item) => item.name === city)?.id] || []); }} options={[{ value: '', label: t('auth_city_placeholder') }, ...locationCities.map((item) => ({ value: item.name, label: item.name }))]} />
                    ) : (
                      <input id="reg-city" type="text" value={form.city} onChange={(event) => { setLocationSource('manual'); set('city')(event); }} placeholder={t('auth_city_placeholder')} className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all" />
                    )}
                  </div>
                </div>
                <div>
                  <NativeSelect
                    id="reg-neighbourhood"
                    label={t('auth_neighbourhood')}
                    value={form.neighbourhood}
                    onChange={(event) => { setLocationSource('manual'); set('neighbourhood')(event); }}
                    options={locLoading ? [{ value: '', label: t('common_loading') }] : [{ value: '', label: t('auth_select_area') }, ...hoodOptions, { value: '__manual__', label: t('auth_manual_area') }]}
                    disabled={locLoading}
                  />
                  {form.neighbourhood === '__manual__' && (
                    <input
                      id="reg-manual-area"
                      type="text"
                      value={manualArea}
                      onChange={(event) => setManualArea(event.target.value)}
                      placeholder={t('auth_area_placeholder')}
                      className="mt-2 w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                    />
                  )}
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
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input type="checkbox" checked={form.vehicleAvailable} onChange={(event) => setForm((current) => ({ ...current, vehicleAvailable: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    Vehicle available for service visits
                  </label>
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
                {t('auth_complete_registration')}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              {t('auth_existing_account')}{' '}
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

