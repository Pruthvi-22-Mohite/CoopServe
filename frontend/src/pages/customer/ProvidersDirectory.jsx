import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { FilterPanel } from '../../components/customer/FilterPanel';
import { ProviderCard } from '../../components/customer/ProviderCard';
import { SmartMatchCard } from '../../components/customer/SmartMatchCard';
import { BookingFlowModal } from '../../components/customer/BookingFlowModal';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Users, Search, Sparkles, Cpu } from 'lucide-react';

export const ProvidersDirectory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topMatch, setTopMatch] = useState(null);
  const [isSmartMatched, setIsSmartMatched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingProvider, setBookingProvider] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Load Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.categories);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Providers whenever filters change
  useEffect(() => {
    const fetchFilteredProviders = async () => {
      setIsLoading(true);
      try {
        const params = {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
          minRating: minRating || undefined,
          maxPrice: maxPrice < 1500 ? maxPrice : undefined,
          availableToday: availableTodayOnly ? 'true' : undefined,
          sortBy
        };

        const res = await api.getProviders(params);
        if (res.success) {
          setProviders(res.providers);
          setTopMatch(res.topMatch || (res.providers.length > 0 ? res.providers[0] : null));
          setIsSmartMatched(!!res.isSmartMatched || sortBy === 'relevance');
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProviders();
  }, [selectedCategory, searchQuery, minRating, maxPrice, availableTodayOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinRating('');
    setMaxPrice(1500);
    setAvailableTodayOnly(false);
    setSortBy('relevance');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verified Cooperative Service Providers"
        description="Connect directly with verified local professionals in Pune. Transparent hourly/fixed rates, verified work history records, and 100% Protected Booking."
        breadcrumbs={['Home', 'Providers']}
        badge={
          <Badge variant="coop" size="sm">
            {providers.length} Available
          </Badge>
        }
      />

      {/* Interactive Filter Panel */}
      <FilterPanel
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        minRating={minRating}
        setMinRating={setMinRating}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        availableTodayOnly={availableTodayOnly}
        setAvailableTodayOnly={setAvailableTodayOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onReset={handleResetFilters}
      />

      {/* AI Smart Match Spotlight Banner when category or search is active */}
      {!isLoading && topMatch && (selectedCategory !== 'all' || searchQuery || sortBy === 'relevance') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <Cpu className="w-4 h-4 text-emerald-600" />
              AI Smart Recommendation Spotlight
            </span>
            <span className="text-slate-400 font-normal">
              Based on skill, proximity, Trust Score & fair workload
            </span>
          </div>
          <SmartMatchCard
            matchResult={topMatch}
            onBook={(prov) => {
              setBookingProvider(prov);
              setIsBookingOpen(true);
            }}
          />
        </div>
      )}

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-2">
        <span>
          {t('filter_showing')} <strong className="text-slate-800 font-bold">{providers.length}</strong> {t('filter_providers')}
        </span>
        {selectedCategory !== 'all' && (
          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md font-semibold">
            Filtered by {selectedCategory}
          </span>
        )}
      </div>

      {/* Providers Grid / Loading / Empty */}
      {isLoading ? (
        <LoadingState message="Searching verified providers..." />
      ) : providers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No providers match your filter criteria"
          description="Try broadening your search query, increasing max price, or selecting all categories."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((prov) => (
            <ProviderCard
              key={prov.id}
              provider={prov}
              onBook={() => {
                setBookingProvider(prov);
                setIsBookingOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Multi-step Booking Modal */}
      {bookingProvider && (
        <BookingFlowModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setBookingProvider(null);
          }}
          provider={bookingProvider}
        />
      )}
    </div>
  );
};
