import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProviderCard } from '../../components/customer/ProviderCard';
import { ServiceCategoryCard } from '../../components/customer/ServiceCategoryCard';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Wrench,
  Zap,
  Calendar,
  Clock,
  ArrowRight,
  Gift,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Users,
  Award
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [aiPick, setAiPick] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [catRes, provRes, bookRes] = await Promise.all([
          api.getCategories(),
          api.getProviders({ sortBy: 'distance' }),
          api.getBookings()
        ]);

        if (catRes.success) setCategories(catRes.categories);
        if (provRes.success) {
          setNearbyProviders(provRes.providers.slice(0, 3));
          // Top AI recommended pick
          const topPick = [...provRes.providers].sort((a, b) => b.trustScore - a.trustScore)[0];
          setAiPick(topPick);
        }
        if (bookRes.success && bookRes.bookings.length > 0) {
          const active = bookRes.bookings.find(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') || bookRes.bookings[0];
          setActiveBooking(active);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/providers?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/customer/services');
    }
  };

  if (isLoading) {
    return <LoadingState message={t('common_loading')} />;
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-card">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('common_guarantee')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('dash_welcome')}, {user?.name?.split(' ')[0] || 'Ananya'}!
          </h1>
          <p className="text-sm text-slate-200 leading-relaxed">
            {t('dash_banner_sub')}
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('dash_search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t('dash_explore_services')}
            </Button>
          </form>
        </div>

        {/* Subtle Decorative Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/15 to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dash_stat_protected')}
          value="1 Active"
          subtitle="CS-2026-00128"
          badgeText="100% Protected"
          accentColor="emerald"
          icon={ShieldCheck}
          onClick={() => navigate('/customer/bookings')}
        />
        <StatCard
          title={t('dash_stat_points')}
          value="450 Pts"
          subtitle="Silver Co-op Member"
          badgeText="₹45 Cash Value"
          accentColor="amber"
          icon={Gift}
          onClick={() => navigate('/customer/profile')}
        />
        <StatCard
          title={t('dash_stat_trust')}
          value="100% Verified"
          subtitle="Zero leakage risk"
          accentColor="teal"
          icon={CheckCircle2}
        />
        <StatCard
          title={t('dash_stat_rating')}
          value="4.92 ⭐"
          subtitle="Pune Cooperative Pool"
          accentColor="indigo"
          icon={Sparkles}
        />
      </div>

      {/* Active Protected Booking Spotlight */}
      {activeBooking && (
        <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="protected" size="sm">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  COOPSERVE PROTECTED BOOKING
                </Badge>
                <span className="text-xs font-bold text-slate-500">ID: {activeBooking.id}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Status: {activeBooking.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeBooking.serviceTitle} • {activeBooking.providerName}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> {activeBooking.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-600" /> {activeBooking.time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {activeBooking.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/customer/booking/${activeBooking.id}`)}
              >
                Track Live Status
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/customer/booking/${activeBooking.id}`)}
              >
                {t('dash_view_details')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* AI Recommended Provider Spotlight */}
      {aiPick && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('dash_recommended_title')}</h2>
                <p className="text-xs text-slate-500">Smart balancing of skill, response time, distance and fair workload</p>
              </div>
            </div>
            <Badge variant="trust" size="sm">97% AI Match Score</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProviderCard provider={aiPick} />
            <Card className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Award className="w-4 h-4" /> Why AI Recommends {aiPick.name}
                </div>
                <h4 className="text-base font-bold mb-3">Multi-Factor Cooperative Scoring</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>✓ Skill & Certification Match</span>
                    <span className="font-bold text-emerald-400">98% Match</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Proximity ({aiPick.distanceKm} km from Kothrud)</span>
                    <span className="font-bold text-teal-400">94% Distance</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Cooperative Trust Score ({aiPick.trustScore}/100)</span>
                    <span className="font-bold text-indigo-400">Top 3% Tier</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Fair Workload Distribution</span>
                    <span className="font-bold text-amber-400">Balanced Allocation</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Guaranteed fixed fee via Protected Booking</span>
                <Button
                  variant="coop"
                  size="sm"
                  onClick={() => navigate(`/customer/provider/${aiPick.id}`)}
                >
                  View Profile & Book
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Popular Service Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('dash_popular_title')}</h2>
            <p className="text-xs text-slate-500">{t('dash_popular_sub')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/customer/services')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            {t('dash_see_all')}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <ServiceCategoryCard
              key={cat.id}
              category={cat}
              onClick={() => navigate(`/customer/providers?category=${cat.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Nearby Cooperative Providers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('dash_nearby_title')}</h2>
            <p className="text-xs text-slate-500">{t('dash_nearby_sub')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/customer/providers')} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            {t('dash_see_all')} ({nearbyProviders.length}+)
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nearbyProviders.map((prov) => (
            <ProviderCard key={prov.id} provider={prov} />
          ))}
        </div>
      </div>
    </div>
  );
};
