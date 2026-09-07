import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Star } from 'lucide-react';

export const ProviderReviews = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    rating: 0,
    reviewsCount: 0,
    fiveStarRate: 0,
    fiveStarCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const statsRes = await api.getProviderStats();
        let providerId = 'me';
        if (statsRes.success) {
          setStats(statsRes.stats);
          if (statsRes.stats?.provider?.id) {
            providerId = statsRes.stats.provider.id;
          }
        }

        const revRes = await api.getProviderReviews(providerId);
        if (revRes.success) {
          setReviewsData({
            reviews: revRes.reviews || [],
            rating: revRes.rating ?? statsRes.stats?.metrics?.rating ?? 0,
            reviewsCount: revRes.reviewsCount ?? revRes.reviews?.length ?? 0,
            fiveStarRate: revRes.fiveStarRate ?? 0,
            fiveStarCount: revRes.fiveStarCount ?? 0
          });
        }
      } catch (err) {
        console.error('Error fetching authentic reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (isLoading) {
    return <LoadingState message={t('worker_loading_reviews', 'Loading authentic customer reviews from MongoDB...')} />;
  }

  const { reviews, rating, reviewsCount, fiveStarRate } = reviewsData;
  const trustScore = stats?.metrics?.trustScore || stats?.provider?.trustScore || 85;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('worker_reviews_page_title', 'Customer Ratings & Feedback')}
        description={t(
          'worker_reviews_page_desc',
          'Authentic feedback collected exclusively after verified job completions. Ratings are calculated dynamically from real customer reviews.'
        )}
        breadcrumbs={[t('nav_dashboard', 'Home'), t('worker_menu_reviews', 'Reviews')]}
        badge={
          <Badge variant={rating > 0 ? 'success' : 'default'} size="sm">
            {rating > 0
              ? `${Number(rating).toFixed(2)} ⭐ ${t('worker_avg_rating_badge', 'Average Rating')}`
              : t('worker_no_reviews_yet_badge', '0.0 ⭐ (No reviews yet)')}
          </Badge>
        }
      />

      {/* Review Summary Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 text-center bg-white border border-slate-200">
          <span className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1.5">
            <Star className={`w-7 h-7 ${rating > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
            {rating > 0 ? Number(rating).toFixed(2) : '0.0'}
          </span>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            {t('worker_overall_rating_box', 'Overall Rating')} ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
          </span>
        </Card>

        <Card className="p-5 text-center bg-white border border-slate-200">
          <span className="text-3xl font-black text-emerald-700">
            {reviewsCount > 0 ? `${fiveStarRate}%` : '0%'}
          </span>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            {t('worker_fivestar_rate_box', '5-Star Completion Rate')} ({reviewsData.fiveStarCount || 0} of {reviewsCount})
          </span>
        </Card>

        <Card className="p-5 text-center bg-white border border-slate-200">
          <span className="text-3xl font-black text-indigo-700">{trustScore}/100</span>
          <span className="text-xs text-slate-500 mt-1 block font-medium">
            {t('worker_trust_index_box', 'CoopServe Trust Index')}
          </span>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {t('worker_recent_reviews_title', 'Customer Reviews')} ({reviews.length})
          </h3>
          <span className="text-xs text-slate-400">
            {t('worker_strictly_verified_sub', 'Strictly verified completed service orders')}
          </span>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title={t('worker_no_reviews_title', 'No customer reviews yet')}
            description={t(
              'worker_no_reviews_desc',
              'Authentic feedback and ratings will appear here as customers complete bookings and submit their verified service reviews.'
            )}
          />
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <Card key={rev.id || rev._id} className="p-4 bg-white border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{rev.customerName || t('worker_verified_badge', 'Verified Customer')}</span>
                  <span className="text-[10px] text-slate-400">{rev.date || rev.createdAt?.split('T')[0]}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(Math.max(1, Math.min(5, Number(rev.rating) || 5)))].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                  {rev.serviceTag && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md ml-2">
                      {rev.serviceTag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
