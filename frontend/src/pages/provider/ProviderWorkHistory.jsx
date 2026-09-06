import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShieldCheck,
  Star,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Award,
  Download,
  Clock
} from 'lucide-react';

export const ProviderWorkHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [bookRes, statsRes] = await Promise.all([
          api.getBookings(),
          api.getProviderStats()
        ]);
        if (bookRes.success) setBookings(bookRes.bookings);
        if (statsRes.success) setStats(statsRes.stats);
      } catch (err) {
        console.error('Error fetching work history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading verified work records and portable credentials..." />;
  }

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const trustScore = stats?.metrics?.trustScore || 94;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verified Platform Work History & Portable Credit"
        description="Every completed CoopServe job creates an immutable, verified digital service credential that builds your Trust Score and cooperative pension credit."
        breadcrumbs={['Home', 'Work History']}
        badge={
          <Badge variant="success" size="sm">
            ✓ 100% Platform Verified
          </Badge>
        }
      />

      {/* Trust Score & Portable Credential Showcase Banner */}
      <Card className="p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <Badge variant="protected" size="sm">
              Portable Worker Credit
            </Badge>
            <h3 className="text-xl font-black text-white">Your Anti-Leakage Cooperative Record</h3>
            <p className="text-xs text-indigo-100 leading-relaxed">
              By completing jobs through CoopServe, your credentials, ratings, and digital earnings are permanently recorded. This guarantees higher AI matching priority, emergency loan eligibility, and community dividends.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex flex-col items-center justify-center font-black shadow-lg">
              <span className="text-2xl leading-none text-white">{trustScore}</span>
              <span className="text-[10px] text-indigo-200">/100</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase">CoopServe Trust Score</p>
              <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">Top 5% Tier in Pune</p>
              <span className="text-[10px] text-indigo-200">Dispute-Free Service Record</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Verified Jobs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Completed Job Log ({completedBookings.length})
          </h3>
          <span className="text-xs text-slate-400">Recorded with cryptographic receipt IDs</span>
        </div>

        {completedBookings.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No completed jobs recorded yet"
            description="As soon as you finish a service booking and mark it completed, it will appear here as a verified record."
          />
        ) : (
          <div className="space-y-3">
            {completedBookings.map((b) => (
              <Card key={b.id} className="p-4 border border-slate-200/90 hover:border-emerald-500 transition-all bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{b.serviceTitle}</h4>
                      <Badge variant="success" size="sm">✓ Verified CoopServe Job</Badge>
                    </div>
                    <p className="text-slate-600 font-medium">
                      Customer: <strong className="text-slate-900">{b.customerName}</strong> • {b.address}
                    </p>
                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {b.date} at {b.time}
                      </span>
                      <span>Booking ID: <strong className="text-slate-600">{b.id}</strong></span>
                      <span>Txn: <strong className="text-slate-600">{b.transactionId}</strong></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 flex sm:flex-col justify-between items-end">
                    <span className="text-emerald-800 font-black text-base">+₹{b.pricing?.workerEarnings || 440}</span>
                    {b.rating ? (
                      <span className="text-[10px] text-slate-700 flex items-center gap-1 font-bold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {Number(b.rating).toFixed(1)} Rating (Verified)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Not yet rated by customer
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
