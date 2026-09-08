import React from 'react';
import { Search, SlidersHorizontal, Star, IndianRupee, MapPin, Award, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../common/Button';

export const FilterPanel = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  minRating,
  setMinRating,
  maxPrice,
  setMaxPrice,
  availableTodayOnly,
  setAvailableTodayOnly,
  sortBy,
  setSortBy,
  onReset
}) => {
  const { t, language } = useLanguage();

  const sortOptions = [
    { value: 'relevance', label: t('filter_sort_relevance') },
    { value: 'distance', label: t('filter_sort_distance') },
    { value: 'rating', label: t('filter_sort_rating') },
    { value: 'price_low', label: t('filter_sort_price_low') },
    { value: 'trust', label: t('filter_sort_trust') }
  ];

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '4.8', label: '4.8 ⭐ & above' },
    { value: '4.5', label: '4.5 ⭐ & above' },
    { value: '4.0', label: '4.0 ⭐ & above' }
  ];

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    minRating ||
    maxPrice < 1500 ||
    availableTodayOnly ||
    sortBy !== 'relevance';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft p-5 space-y-4">
      {/* Search Bar + Sort Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('filter_search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{t('filter_sort_by')}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
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

      {/* Secondary Filter Controls (Rating, Max Price, Available Today, Reset) */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 items-center text-xs">
        {/* Rating Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t('filter_rating')}
          </label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {ratingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price Filter */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span>{t('filter_price_range')}</span>
            <span className="text-emerald-700 font-bold">≤ ₹{maxPrice}</span>
          </div>
          <input
            type="range"
            min="250"
            max="1500"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Available Today Toggle */}
        <div className="flex items-center gap-2 pt-3 sm:pt-0">
          <input
            type="checkbox"
            id="availToday"
            checked={availableTodayOnly}
            onChange={(e) => setAvailableTodayOnly(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <label htmlFor="availToday" className="text-xs font-semibold text-slate-700 cursor-pointer">
            {t('filter_avail_today')}
          </label>
        </div>

        {/* Reset Filters CTA */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              onClick={onReset}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              {t('filter_reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
