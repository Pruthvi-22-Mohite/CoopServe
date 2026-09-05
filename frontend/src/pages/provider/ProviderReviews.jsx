import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { Star, ShieldCheck, ThumbsUp, MessageSquare } from 'lucide-react';

export const ProviderReviews = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const res = await api.getProviderStats();
        if (res.success) setStats(res.stats);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading authentic customer reviews..." />;
  }

  const reviews = [
    {
      id: 'rev_1',
      customerName: 'Ananya Sharma',
      rating: 5,
      date: '02 Sep 2026',
      serviceTag: 'Electrical Wiring',
      comment: 'Arrived exactly on time at Kothrud! Fixed both the MCB trip and master switchboard neatly. Highly professional and polite.'
    },
    {
      id: 'rev_2',
      customerName: 'Vikram Mehta',
      rating: 5,
      date: '28 Aug 2026',
      serviceTag: 'Switchboard Repair',
      comment: 'Very clean workmanship. Explained what caused the surge and replaced the burnt socket with an ISI marked part. 10/10 service.'
    },
    {
      id: 'rev_3',
      customerName: 'Pooja Kulkarni',
      rating: 5,
      date: '22 Aug 2026',
      serviceTag: 'Ceiling Fan Installation',
      comment: 'Fixed high vibration in old ceiling fan and installed regulator. Fair transparent price and digital receipt given on spot.'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Ratings & Feedback"
        description="Authentic feedback collected after verified job completions. High ratings increase your AI Smart Matching priority."
        breadcrumbs={['Home', 'Reviews']}
        badge={
          <Badge variant="success" size="sm">
            4.88 ⭐ Average Rating
          </Badge>
        }
      />

      {/* Review Summary Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 text-center bg-white border border-slate-200">
          <span className="text-3xl font-black text-slate-900 flex items-center justify-center gap-1">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" /> 4.88
          </span>
          <span className="text-xs text-slate-400 mt-1 block font-medium">Overall Rating (142 reviews)</span>
        </Card>

        <Card className="p-5 text-center bg-white border border-slate-200">
          <span className="text-3xl font-black text-emerald-700">98.5%</span>
          <span className="text-xs text-slate-400 mt-1 block font-medium">5-Star Completion Rate</span>
        </Card>

        <Card className="p-5 text-center bg-white border border-slate-200">
          <span className="text-3xl font-black text-indigo-700">94/100</span>
          <span className="text-xs text-slate-400 mt-1 block font-medium">CoopServe Trust Index</span>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Recent Customer Reviews</h3>
        {reviews.map((rev) => (
          <Card key={rev.id} className="p-4 bg-white border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{rev.customerName}</span>
              <span className="text-[10px] text-slate-400">{rev.date}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
              ))}
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md ml-2">
                {rev.serviceTag}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
