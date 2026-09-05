import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SmartMatchModal } from '../../components/customer/SmartMatchModal';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Search,
  Clock,
  Star,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

export const ServicesDirectory = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Smart Match Modal State
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [matchingService, setMatchingService] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catRes, srvRes] = await Promise.all([
          api.getCategories(),
          api.getServices(selectedCategory)
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (srvRes.success) setServices(srvRes.services);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const filteredServices = services.filter((srv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return srv.title.toLowerCase().includes(q) || srv.description.toLowerCase().includes(q);
  });

  const getServiceTitle = (srv) => {
    if (language === 'hi' && srv.titleHi) return srv.titleHi;
    if (language === 'mr' && srv.titleMr) return srv.titleMr;
    return srv.title;
  };

  const handleTriggerSmartMatch = (srv) => {
    setMatchingService(srv);
    setMatchModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav_services')}
        description="Browse certified household and community services with transparent base pricing, distance travel compensation, 30-day rework warranty, and 90% direct worker payout."
        breadcrumbs={['Home', 'Services']}
      />

      {/* Category Pills & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('filter_all_categories')}
          </button>
          {categories.map((cat) => {
            const title =
              language === 'hi' && cat.nameHi
                ? cat.nameHi
                : language === 'mr' && cat.nameMr
                ? cat.nameMr
                : cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <LoadingState message="Loading cooperative service catalog..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <Card key={srv.id} hoverable className="flex flex-col justify-between overflow-hidden p-0 border border-slate-200/90 group">
              <div>
                {/* Service Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="protected" size="sm">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Co-op Protected
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{srv.rating}</span>
                    <span className="text-[10px] text-slate-300">({srv.bookingsCount})</span>
                  </div>
                </div>

                {/* Service Details Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {srv.categoryId}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                      {getServiceTitle(srv)}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {srv.description}
                    </p>
                  </div>

                  {/* Included Checklist */}
                  {srv.included && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">What's Included:</p>
                      {srv.included.slice(0, 3).map((inc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{inc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer with Smart Match CTA */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Starting from (Base)</span>
                  <span className="text-lg font-black text-slate-900">₹{srv.basePrice}</span>
                  <span className="text-[10px] text-slate-500 block font-medium">⏱️ {srv.duration}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="coop"
                    size="sm"
                    onClick={() => handleTriggerSmartMatch(srv)}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 animate-pulse" />}
                  >
                    AI Match
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/customer/providers?category=${srv.categoryId}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Browse
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Smart Match Modal */}
      <SmartMatchModal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        category={matchingService?.categoryId}
        serviceTitle={matchingService?.title}
        initialServiceId={matchingService?.id}
      />
    </div>
  );
};
