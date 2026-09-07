import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { BookingFlowModal } from '../../components/customer/BookingFlowModal';
import {
  Star,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Calendar,
  Clock,
  Award,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  ChevronRight
} from 'lucide-react';

export const ProviderDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing', 'history', 'reviews'
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      setIsLoading(true);
      try {
        const res = await api.getProviderById(id);
        if (res.success && res.provider) {
          setProvider(res.provider);
          if (res.provider.pricingTiers && res.provider.pricingTiers.length > 0) {
            setSelectedTask(res.provider.pricingTiers[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching provider:', err);
        showToast('Provider profile not found', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  if (isLoading) {
    return <LoadingState message="Loading certified provider record..." />;
  }

  if (!provider) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800">{t('provider_profile_not_found')}</h3>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/customer/providers')}>
          {t('providers_back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={provider.name}
        description={`${t('provider_verified_partner')} • ${t('provider_member_id')}: ${provider.coopMemberId || ''}`}
        breadcrumbs={[t('nav_home'), t('nav_providers'), provider.name]}
        badge={
          <Badge variant="success" size="sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {t('provider_verified_pro')}
          </Badge>
        }
      />

      {/* Profile Overview Hero Card */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Avatar + Main Information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar
              src={provider.avatar}
              name={provider.name}
              size="xl"
              isVerified={provider.isVerified}
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{provider.name}</h2>
                <Badge variant="coop" size="sm">
                  {provider.coopMemberId}
                </Badge>
                <Badge variant="protected" size="sm">
                  {t('provider_worker_net')}
                </Badge>
              </div>

              <p className="text-sm font-bold text-emerald-800">{provider.skill}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {provider.location} ({provider.distanceKm} km away)
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {provider.rating} ({provider.reviewsCount} reviews)
                </span>
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <Clock className="w-3.5 h-3.5" /> {provider.availabilityStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Trust Score Metric Showcase */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center font-black shadow-md">
              <span className="text-lg leading-none">{provider.trustScore}</span>
              <span className="text-[9px] text-indigo-200">/100</span>
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                {t('provider_trust_score')}
              </p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                {t('provider_trust_description')}
              </p>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 mt-1">
                ✓ {t('provider_on_time_record')}
              </span>
            </div>
          </div>
        </div>

        {/* Bio Snippet */}
        {provider.bio && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{t('prof_about')}</p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
              {provider.bio}
            </p>
          </div>
        )}

        {/* Service Areas Tags */}
        {provider.serviceAreas && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1">{t('provider_service_hubs')}:</span>
            {provider.serviceAreas.map((area, idx) => (
              <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-medium">
                {area}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Main Tabbed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Tabs for Services/Pricing, Work History, Reviews */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl">
            <button
              onClick={() => setActiveTab('pricing')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'pricing'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('prof_services_pricing')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('prof_work_history')} ({provider.workHistory?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('prof_reviews')} ({provider.reviews?.length || 0})
            </button>
          </div>

          {/* Tab 1: Transparent Services & Rates */}
          {activeTab === 'pricing' && (
            <Card className="rounded-t-none p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t('provider_rate_card')}</h3>
                  <p className="text-xs text-slate-500">{t('provider_rate_description')}</p>
                </div>
                <Badge variant="protected" size="sm">
                  {t('provider_protected_rate')}
                </Badge>
              </div>

              <div className="space-y-2">
                {provider.pricingTiers?.map((tier, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedTask(tier)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedTask?.item === tier.item
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        selectedTask?.item === tier.item ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {selectedTask?.item === tier.item && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{tier.item}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">₹{tier.price}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 2: Verified Work History */}
          {activeTab === 'history' && (
            <Card className="rounded-t-none p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t('provider_work_record')}</h3>
                  <p className="text-xs text-slate-500">{t('provider_work_record_description')}</p>
                </div>
                <Badge variant="coop" size="sm">
                  {t('provider_verified')}
                </Badge>
              </div>

              <div className="space-y-3">
                {provider.workHistory?.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{item.service}</span>
                        <Badge variant="success" size="sm">✓ {t('provider_verified_job')}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t('common_customer')}: {item.customer} • {t('common_date')}: {item.date} • {t('common_id')}: {item.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {item.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab 3: Customer Reviews */}
          {activeTab === 'reviews' && (
            <Card className="rounded-t-none p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Verified Customer Reviews</h3>
                  <p className="text-xs text-slate-500">Authentic feedback from completed bookings</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{provider.rating} / 5.0</span>
                </div>
              </div>

              <div className="space-y-3">
                {provider.reviews?.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500" />
                      ))}
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-md ml-2">
                        {rev.serviceTag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (4 cols): Protected Booking Action Box */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border-2 border-emerald-500 shadow-lg sticky top-24 bg-gradient-to-b from-emerald-50/30 to-white">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">CoopServe Protected</h3>
                <p className="text-[10px] text-emerald-700 font-medium">Guaranteed price & verified technician</p>
              </div>
            </div>

            {/* Selected Service Snippet */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 mb-4 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Selected Task</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedTask?.item || provider.skill}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">Base Service Price</span>
                <span className="font-bold text-slate-900">Starting from ₹{selectedTask?.price || provider.startingPrice}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Distance ({provider.distanceKm} km)</span>
                <span className="font-medium text-teal-800">
                  {provider.distanceKm <= 2 ? '₹0 Travel Fee' : `+₹${provider.distanceKm <= 5 ? 20 : provider.distanceKm <= 10 ? 40 : 80} Travel Fee`}
                </span>
              </div>
            </div>

            {/* Transparent Fee Split Preview */}
            <div className="space-y-1.5 text-[11px] text-slate-600 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex justify-between font-medium">
                <span>Direct Worker Payout (90%)</span>
                <span className="font-bold text-emerald-800">
                  90% Direct Net
                </span>
              </div>
              <div className="flex justify-between font-medium text-slate-500">
                <span>Platform Fee & Guarantee (10%)</span>
                <span className="font-medium text-slate-700">
                  10% Operations
                </span>
              </div>
            </div>

            <Button
              variant="coop"
              size="lg"
              className="w-full shadow-md"
              onClick={() => setBookingModalOpen(true)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('prof_direct_book')}
            </Button>

            <p className="text-[10px] text-slate-400 text-center mt-3 leading-tight">
              Includes 30-day rework protection & dispute arbitration through cooperative council.
            </p>
          </Card>
        </div>
      </div>

      {/* Interactive Booking & Payment Modal */}
      <BookingFlowModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        provider={provider}
        initialService={selectedTask}
        initialPrice={selectedTask?.price}
      />
    </div>
  );
};
