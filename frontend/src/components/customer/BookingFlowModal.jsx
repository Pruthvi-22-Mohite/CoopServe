import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Smartphone,
  Wallet,
  Building,
  Check,
  Download,
  Info,
  Navigation,
  Loader2
} from 'lucide-react';
import { calculateBookingPrice, calculateDistanceKm } from '../../utils/pricingCalculator';
import { useLanguage } from '../../context/LanguageContext';

export const BookingFlowModal = ({
  isOpen,
  onClose,
  provider,
  initialService,
  initialPrice,
  onBookingCreated
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Service, 2: Slot & Address, 3: Protected Breakdown, 4: Payment, 5: Confirmation
  const [selectedTask, setSelectedTask] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [serviceLocation, setServiceLocation] = useState({ state: '', city: '', area: '', latitude: null, longitude: null });
  const [locationStatus, setLocationStatus] = useState('idle');
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsUnavailable, setSlotsUnavailable] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay Sandbox (UPI / Cards / NetBanking)');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCreatedBooking(null);
      setPaymentConfirmed(false);
      setIsVerifyingPayment(false);
      setAddress('');
      setServiceLocation({ state: '', city: '', area: '', latitude: null, longitude: null });
      setLocationStatus('idle');
      if (provider?.pricingTiers && provider.pricingTiers.length > 0) {
        setSelectedTask(provider.pricingTiers[0]);
      } else {
        setSelectedTask({
          item: initialService?.title || provider?.skill || '',
          price: initialPrice || provider?.startingPrice || 0
        });
      }
    }
  }, [isOpen, provider, initialService, initialPrice]);

  if (!isOpen || !provider) return null;

  const basePrice = Number(selectedTask?.price || initialPrice || provider.startingPrice || 0);
  const distanceKm = calculateDistanceKm(
    serviceLocation.latitude,
    serviceLocation.longitude,
    provider.latitude,
    provider.longitude
  ) ?? 0;
  const extraCharges = 0;

  const pricing = calculateBookingPrice({
    basePrice,
    distanceKm,
    extraCharges
  });

  const timeSlots = [
    '09:00 AM - 10:30 AM',
    '11:00 AM - 12:30 PM',
    '02:00 PM - 03:30 PM',
    '04:30 PM - 06:00 PM',
    '06:30 PM - 08:00 PM'
  ];

  // Fetch booked slots whenever date or provider changes
  useEffect(() => {
    if (!isOpen || !provider?.id || !date) return;
    setSlotsLoading(true);
    setSlotsUnavailable(false);
    api.getProviderBookedSlots(provider.id, date)
      .then((res) => {
        const slots = res.bookedSlots || res.slots || [];
        setBookedSlots(slots);
        // Auto-select first available slot
        const firstAvail = timeSlots.find((s) => !slots.includes(s.split(' - ')[0]));
        if (firstAvail) setTimeSlot(firstAvail);
      })
      .catch(() => {
        setBookedSlots([]);
        setSlotsUnavailable(true);
        setTimeSlot('');
      })
      .finally(() => setSlotsLoading(false));
  }, [date, provider?.id, isOpen]);

  const availableTimeSlots = slotsUnavailable
    ? []
    : timeSlots.filter((slot) => !bookedSlots.includes(slot.split(' - ')[0]));

  const captureBookingLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=14&addressdetails=1`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' }
          });
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error(`Reverse geocoding failed: ${response.status}`);
          const address = (await response.json()).address || {};
          const state = address.state || '';
          const city = address.city || address.town || address.municipality || address.village || address.state_district || '';
          const area = address.suburb || address.neighbourhood || address.city_district || address.residential || address.quarter || address.county || '';
          if (!state || !city || !area) throw new Error('Location unavailable');
          setServiceLocation({ state, city, area, latitude: coords.latitude, longitude: coords.longitude });
          setLocationStatus('ready');
        } catch {
          setLocationStatus('error');
        }
      },
      () => setLocationStatus('error'),
      { timeout: 8000 }
    );
  };

  const handleProcessPayment = async () => {
    setIsProcessingPayment(true);
    try {
      let resolvedLocation = serviceLocation;
      if (!Number.isFinite(resolvedLocation.latitude) || !Number.isFinite(resolvedLocation.longitude)) {
        setLocationStatus('loading');
        try {
          const locationQuery = [resolvedLocation.area, resolvedLocation.city, resolvedLocation.state].filter(Boolean).join(', ');
          if (!locationQuery) throw new Error(t('booking_location_required'));
          const query = encodeURIComponent(locationQuery);
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, { headers: { Accept: 'application/json' } });
          const results = await response.json();
          if (!results[0]) throw new Error(t('booking_location_unavailable'));
          resolvedLocation = { ...resolvedLocation, latitude: Number(results[0].lat), longitude: Number(results[0].lon) };
          setServiceLocation(resolvedLocation);
          setLocationStatus('ready');
        } catch (locationError) {
          setLocationStatus('error');
          throw new Error(t('booking_location_required'));
        }
      }

      const resolvedDistanceKm = calculateDistanceKm(
        resolvedLocation.latitude,
        resolvedLocation.longitude,
        provider.latitude,
        provider.longitude
      );
      const bookingPricing = calculateBookingPrice({ basePrice, distanceKm: resolvedDistanceKm ?? 0, extraCharges });
      const bookingPayload = {
        providerId: provider.id,
        serviceTitle: selectedTask?.item || provider.skill,
        category: provider.categories?.[0] || 'general',
        basePrice: bookingPricing.basePrice,
        distanceKm: bookingPricing.distanceKm,
        travelFee: bookingPricing.travelFee,
        extraCharges: bookingPricing.extraCharges,
        price: bookingPricing.customerTotal,
        pricing: bookingPricing,
        date,
        time: timeSlot.split(' - ')[0],
        address: [resolvedLocation.state, resolvedLocation.city, resolvedLocation.area].filter(Boolean).join(', '),
        serviceState: resolvedLocation.state,
        serviceCity: resolvedLocation.city,
        serviceArea: resolvedLocation.area,
        serviceLatitude: resolvedLocation.latitude,
        serviceLongitude: resolvedLocation.longitude,
        notes,
        paymentMethod: 'Razorpay'
      };

      if (slotsUnavailable || !timeSlot || bookedSlots.includes(timeSlot.split(' - ')[0])) {
        throw new Error(t('booking_slot_unavailable'));
      }

      // 1. Create booking in DB (starts as PENDING payment)
      const res = await api.createBooking(bookingPayload);
      if (!res.success || !res.booking) {
        throw new Error(res.message || 'Booking creation failed');
      }

      const newBooking = res.booking;
      setCreatedBooking(newBooking);

      // 2. Create Razorpay order on backend
      const orderData = await api.createRazorpayOrder(newBooking.id);
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize payment gateway order');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout SDK is not loaded. Please verify connection.');
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: orderData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'CoopServe Platform',
        description: `Protected Booking: ${newBooking.serviceTitle}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#059669'
        },
        handler: async function () {
          setStep(5);
          setIsVerifyingPayment(true);
          showToast(t('payment_submitted'), 'info');

          // Refetch payment status after 3 seconds
          setTimeout(async () => {
            try {
              const statusRes = await api.getPaymentStatus(newBooking.id);
              if (statusRes.success && statusRes.paymentStatus === 'PAID') {
                setPaymentConfirmed(true);
                setCreatedBooking(prev => ({
                  ...prev,
                  paymentStatus: 'PAID',
                  razorpayPaymentId: statusRes.paymentId
                }));
                if (onBookingCreated) {
                  onBookingCreated(newBooking);
                }
                showToast('Payment verified successfully! Protected booking confirmed.', 'success');
              } else {
                showToast('Payment verification in progress. You can view status anytime.', 'info');
              }
            } catch (statusErr) {
              console.error('Status verification error:', statusErr);
            } finally {
              setIsVerifyingPayment(false);
            }
          }, 3000);
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            showToast('Checkout window closed. Booking saved with payment pending.', 'info');
            setStep(5);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (failResponse) {
        setIsProcessingPayment(false);
        showToast(failResponse.error?.description || 'Payment failed. Please try again.', 'error');
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      showToast(err.message || 'Payment processing error', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 5 ? t('booking_confirmed') : t('booking_title')}
      description={step === 5 ? t('booking_confirmed') : `${t('booking_step_service')} ${step} / 4`}
      maxWidth="max-w-2xl"
    >
      {/* Step Indicator */}
      {step < 5 && (
        <div className="flex items-center justify-between mb-6 px-1">
          {[t('booking_step_service'), t('booking_step_schedule'), t('booking_step_breakdown'), t('booking_step_payment')].map((label, idx) => {
            const stepNum = idx + 1;
            const isDone = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 font-extrabold'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                </div>
                <span className={`text-xs hidden sm:inline ${isCurrent ? 'font-bold text-emerald-900' : 'text-slate-400'}`}>
                  {label}
                </span>
                {idx < 3 && <div className="w-6 sm:w-10 h-0.5 bg-slate-200" />}
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 1: Service Selection */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Provider Mini Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar src={provider.avatar} name={provider.name} size="md" isVerified={true} />
              <div>
                <p className="text-xs font-bold text-slate-900">{provider.name}</p>
                <p className="text-[11px] text-slate-500">{provider.skill} • {provider.location}</p>
              </div>
            </div>
            <Badge variant="coop" size="sm">{t('booking_trust_score')}: {provider.trustScore ?? 0}/100</Badge>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              {t('booking_step_service')}
            </label>
            <div className="space-y-2">
              {provider.pricingTiers?.map((tier, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTask(tier)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedTask?.item === tier.item
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      selectedTask?.item === tier.item ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {selectedTask?.item === tier.item && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{tier.item}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">₹{tier.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(2)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('booking_continue')}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Date, Time & Address */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('booking_date')}
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('booking_time')}
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {slotsLoading ? (
                  <option>{t('booking_slots_loading')}</option>
                ) : availableTimeSlots.length === 0 ? (
                  <option value="">{t('booking_slots_full')}</option>
                ) : (
                  availableTimeSlots.map((slot, idx) => (
                    <option key={idx} value={slot}>{slot}</option>
                  ))
                )}
              </select>
              {!slotsLoading && availableTimeSlots.length === 0 && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{slotsUnavailable ? t('booking_slot_unavailable') : t('booking_slots_full')}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">{t('booking_address')}</label>
              <div className="flex items-center gap-3">
                <button type="button" className="text-[11px] font-bold text-emerald-700 hover:underline" onClick={captureBookingLocation} disabled={locationStatus === 'loading'}>
                  {locationStatus === 'loading' ? t('auth_locating') : t('auth_use_location')}
                </button>
                {user?.state && user?.city && user?.neighbourhood && (
                  <button type="button" className="text-[11px] font-bold text-emerald-700 hover:underline" onClick={() => {
                    setServiceLocation({ state: user.state, city: user.city, area: user.neighbourhood, latitude: user.lat ?? null, longitude: user.lng ?? null });
                    setLocationStatus('saved');
                  }}>{t('booking_use_saved_location')}</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" value={serviceLocation.state} onChange={(e) => setServiceLocation((current) => ({ ...current, state: e.target.value, latitude: null, longitude: null }))} placeholder={t('auth_state')} className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900" />
              <input type="text" value={serviceLocation.city} onChange={(e) => setServiceLocation((current) => ({ ...current, city: e.target.value, latitude: null, longitude: null }))} placeholder={t('auth_city')} className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900" />
              <input type="text" value={serviceLocation.area} onChange={(e) => setServiceLocation((current) => ({ ...current, area: e.target.value, latitude: null, longitude: null }))} placeholder={t('auth_area_placeholder')} className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900" />
            </div>
            {locationStatus === 'error' && <p className="text-xs text-rose-600">{t('booking_location_required')}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t('booking_notes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('booking_notes_placeholder')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t('booking_back')}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(3)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('booking_review_price')}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: COOPSERVE PROTECTED & Transparent Price Breakdown */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Prominent COOPSERVE PROTECTED Guarantee Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/30 rounded-lg border border-emerald-400/40">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight text-white">{t('booking_protected_title')}</h4>
                  <p className="text-[10px] text-emerald-200 font-medium">{t('booking_guaranteed_transaction')}</p>
                </div>
              </div>
              <Badge variant="success" size="sm">{t('booking_coop_verified')}</Badge>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {t('booking_protection_description')}
            </p>

            {/* Guaranteed Protections Checklist */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-700/60 text-[11px] text-emerald-100">
              <span className="flex items-center gap-1.5">✓ {t('booking_verified_provider')}</span>
              <span className="flex items-center gap-1.5">✓ {t('booking_protection')}</span>
              <span className="flex items-center gap-1.5">✓ {t('booking_digital_receipt')}</span>
              <span className="flex items-center gap-1.5">✓ {t('booking_dispute_support')}</span>
              <span className="flex items-center gap-1.5">✓ {t('booking_work_record')}</span>
              <span className="flex items-center gap-1.5">✓ {t('booking_worker_payout')}</span>
            </div>
          </div>

          {/* Transparent Fee Breakdown Card */}
          <Card className="p-4 bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('booking_price_breakdown')}</h4>
              <span className="text-[11px] text-emerald-700 font-bold">{t('booking_clear_pricing')}</span>
            </div>

            {/* Base Price + Distance Fee Line Items */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-medium text-slate-700">
                <span>{t('booking_base_price')} ({selectedTask?.item || provider.skill})</span>
                <span className="font-bold text-slate-900">₹{pricing.basePrice}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-teal-600" />
                  {t('booking_distance_fee')} ({pricing.distanceKm} km)
                </span>
                <span className="font-bold text-slate-900">
                  {pricing.travelFee === 0 ? `₹0 (${t('booking_free_short_distance')})` : `₹${pricing.travelFee}`}
                </span>
              </div>
              <div className="flex justify-between font-medium text-slate-700">
                <span>{t('booking_extra_charges')}</span>
                <span className="font-bold text-slate-900">₹{pricing.extraCharges}</span>
              </div>

              {/* Total + Upfront Breakdown */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-sm font-black text-slate-900">
                  <span>{t('booking_total')}</span>
                  <span className="text-emerald-700 text-base font-black">₹{pricing.customerTotal}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <span>{t('booking_upfront')}</span>
                  <span>₹{pricing.upfrontPayable}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t('booking_remaining')}</span>
                  <span className="font-semibold">₹{pricing.remainingPayable}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic">{t('booking_upfront_note')}</p>
            </div>

            {/* Transparent 90/10 Fair Distribution */}
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
              <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                {t('booking_fair_share')}
              </div>
              <div className="flex justify-between font-semibold text-emerald-900">
                <span>{t('booking_worker_earnings')}</span>
                <span className="font-bold">₹{pricing.workerEarnings}</span>
              </div>
              <div className="flex justify-between font-normal text-emerald-800 text-[11px]">
                <span>{t('booking_platform_operations')}</span>
                <span>₹{pricing.platformFee}</span>
              </div>
            </div>
          </Card>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t('booking_back')}
            </Button>
            <Button
              variant="coop"
              size="md"
              onClick={() => setStep(4)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('booking_proceed_payment')} (₹{pricing.customerTotal})
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Razorpay Payment */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div>
              <p className="text-xs font-bold text-emerald-900">{t('booking_upfront')}</p>
              <p className="text-[10px] text-emerald-700">
                Total: ₹{pricing.customerTotal} • Travel ({pricing.distanceKm} km): ₹{pricing.travelFee}
              </p>
            </div>
            <span className="text-xl font-black text-emerald-800">₹{pricing.upfrontPayable}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('payment_gateway')}
              </span>
              <Badge variant="coop" size="sm">{t('payment_sandbox')}</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('payment_gateway_description')}
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-1 bg-white p-2 rounded-lg border border-slate-200">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('payment_upi')}</span>
              </div>
              <div className="flex items-center gap-1 bg-white p-2 rounded-lg border border-slate-200">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('payment_cards')}</span>
              </div>
              <div className="flex items-center gap-1 bg-white p-2 rounded-lg border border-slate-200">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('payment_netbanking')}</span>
              </div>
              <div className="flex items-center gap-1 bg-white p-2 rounded-lg border border-slate-200">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('payment_wallets')}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={isProcessingPayment}
              onClick={handleProcessPayment}
              rightIcon={<ShieldCheck className="w-4 h-4" />}
            >
              {t('booking_pay_upfront')} ₹{pricing.upfrontPayable} via Razorpay
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Confirmation & Digital Receipt */}
      {step === 5 && createdBooking && (
        <div className="space-y-5 text-center py-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner ring-8 ring-emerald-50">
            {isVerifyingPayment ? (
              <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
            ) : (paymentConfirmed || createdBooking.paymentStatus === 'PAID') ? (
              <CheckCircle2 className="w-9 h-9" />
            ) : (
              <ShieldCheck className="w-9 h-9" />
            )}
          </div>

          <div className="space-y-1">
            <Badge variant={isVerifyingPayment ? 'warning' : (paymentConfirmed || createdBooking.paymentStatus === 'PAID') ? 'protected' : 'warning'} size="md">
              {isVerifyingPayment
                ? 'VERIFYING PAYMENT VIA WEBHOOK'
                : (paymentConfirmed || createdBooking.paymentStatus === 'PAID')
                ? 'COOPSERVE PROTECTED ACTIVE'
                : 'PAYMENT VERIFICATION PENDING'}
            </Badge>
            <h3 className="text-xl font-black text-slate-900">
              {isVerifyingPayment
                ? 'PROCESSING PAYMENT'
                : (paymentConfirmed || createdBooking.paymentStatus === 'PAID')
                ? 'PAYMENT CONFIRMED'
                : 'BOOKING SCHEDULED'}
            </h3>
            <p className="text-xs text-slate-500">
              {isVerifyingPayment
                ? 'Awaiting webhook signature confirmation from Razorpay sandbox...'
                : (paymentConfirmed || createdBooking.paymentStatus === 'PAID')
                ? 'Your payment was verified. Service is recorded on CoopServe.'
                : 'Booking created with payment pending. You can track status in your dashboard.'}
            </p>
          </div>

          {/* Digital Receipt Card */}
          <Card className="p-4 bg-slate-50 border border-slate-200 text-left space-y-3 max-w-lg mx-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-700">{t('payment_booking_id')}</span>
              <span className="font-black text-emerald-700">{createdBooking.id}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">{t('payment_transaction_id')}</span>
              <span className="font-bold text-slate-800">{createdBooking.transactionId}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">{t('payment_assigned_provider')}</span>
              <span className="font-bold text-slate-800">{createdBooking.providerName}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">{t('payment_service')}</span>
              <span className="font-bold text-slate-800">{createdBooking.serviceTitle}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">{t('payment_scheduled_time')}</span>
              <span className="font-bold text-slate-800">{createdBooking.date} at {createdBooking.time}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('booking_base_price')}</span>
                <span className="font-semibold text-slate-900">₹{createdBooking.pricing?.basePrice || pricing.basePrice}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Distance Travel Fee ({createdBooking.pricing?.distanceKm || pricing.distanceKm} km)</span>
                <span className="font-semibold text-slate-900">₹{createdBooking.pricing?.travelFee ?? pricing.travelFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('booking_extra_charges')}</span>
                <span className="font-semibold text-slate-900">₹{createdBooking.pricing?.extraCharges || 0}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center font-black">
                <span className="text-slate-900">{t('payment_total_customer')}</span>
                <span className="text-emerald-700 text-sm">₹{createdBooking.pricing?.customerTotal || createdBooking.pricing?.customerPayment || pricing.customerTotal}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>{t('booking_worker_earnings')}</span>
                <span className="font-bold text-emerald-800">₹{createdBooking.pricing?.workerEarnings || pricing.workerEarnings}</span>
              </div>
            </div>
          </Card>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => {
                onClose();
                navigate('/customer/bookings');
              }}
            >
              {t('booking_view_all')}
            </Button>
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => {
                onClose();
                navigate(`/customer/booking/${createdBooking.id}`);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('booking_track_status')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
