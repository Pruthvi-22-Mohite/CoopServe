import React, { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAdminLiveRefresh } from '../../hooks/useAdminLiveRefresh';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Eye } from 'lucide-react';

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const paymentVariant = (status) => {
  if (status === 'PAID') return 'success';
  if (status === 'REFUNDED') return 'warning';
  if (status === 'FAILED') return 'danger';
  return 'protected';
};

export const AdminBookings = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.getAdminBookings();
      if (res.success) {
        setBookings(res.bookings || []);
        setError('');
      } else {
        setError(res.message || t('admin_error_load'));
      }
    } catch (err) {
      setError(err.message || t('admin_error_load'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useAdminLiveRefresh(fetchBookings);

  if (isLoading) {
    return <LoadingState message={t('admin_bookings_loading')} />;
  }

  if (error && bookings.length === 0) {
    return <EmptyState title={t('admin_error_title')} description={error} />;
  }

  const filtered = bookings.filter((b) => {
    const haystack = [b.id, b.customerName, b.providerName, b.serviceTitle].join(' ').toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const map = {
      COMPLETED: 'success',
      CANCELLED: 'danger',
      REJECTED: 'danger',
      IN_PROGRESS: 'warning',
      ARRIVED: 'warning',
      ON_THE_WAY: 'info',
      PROVIDER_ACCEPTED: 'primary',
      ACCEPTED: 'primary',
      BOOKED: 'protected'
    };
    return <Badge variant={map[status] || 'protected'} size="sm">{t(`admin_status_${String(status || 'booked').toLowerCase()}`, status)}</Badge>;
  };

  const geotagStatus = (booking) => {
    if (booking.reviewRequired) {
      return <Badge variant="danger" size="sm">{t('admin_geo_review')}</Badge>;
    }
    if (booking.locationVerification?.start?.status === 'VERIFIED' || booking.locationVerification?.completion?.status === 'VERIFIED') {
      return <Badge variant="success" size="sm">{t('admin_geo_verified')}</Badge>;
    }
    return <Badge variant="protected" size="sm">{t('admin_geo_not_checked')}</Badge>;
  };

  const geoReviewCount = bookings.filter((b) => b.reviewRequired).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_bookings_title')}
        description={t('admin_bookings_desc')}
        breadcrumbs={[t('nav_home'), t('role_admin_portal'), t('admin_nav_bookings')]}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="coop" size="sm">
              {bookings.length} {t('admin_stat_total_bookings')}
            </Badge>
            {geoReviewCount > 0 && (
              <Badge variant="danger" size="sm">
                {geoReviewCount} {t('admin_bookings_badge_geo')}
              </Badge>
            )}
          </div>
        }
      />

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('admin_bookings_search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-soft">
        {filtered.length === 0 ? (
          <EmptyState
            title={bookings.length === 0 ? t('admin_bookings_empty') : t('admin_bookings_no_results')}
            className="m-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">{t('admin_bookings_col_booking')}</th>
                  <th className="py-3.5 px-4">{t('admin_bookings_col_service')}</th>
                  <th className="py-3.5 px-4">{t('admin_bookings_customer')}</th>
                  <th className="py-3.5 px-4">{t('admin_bookings_provider')}</th>
                  <th className="py-3.5 px-4">{t('admin_bookings_date')}</th>
                  <th className="py-3.5 px-4">{t('admin_bookings_col_payment')}</th>
                  <th className="py-3.5 px-4">{t('admin_bookings_col_status')}</th>
                  <th className="py-3.5 px-4">{t('admin_bookings_col_geo')}</th>
                  <th className="py-3.5 px-4">{t('admin_bookings_payment_status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('admin_bookings_col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => {
                  const total = b.pricing?.customerTotal ?? b.price ?? 0;
                  const workerNet = b.pricing?.workerEarnings ?? 0;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900">{b.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{b.serviceTitle}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{b.customerName}</p>
                        <p className="text-[10px] text-slate-400">{b.customerPhone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-emerald-800">{b.providerName}</p>
                        <p className="text-[10px] text-slate-400">{b.providerSkill}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{b.date} {b.time}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{formatInr(total)}</span>
                        <span className="text-[10px] text-emerald-700 block">{t('admin_bookings_worker_net')}: {formatInr(workerNet)}</span>
                        {(b.status === 'CANCELLED') && (
                          <span className="text-[10px] text-amber-700 block">
                            {t('admin_bookings_refund')}: {formatInr(b.refundAmount ?? b.pricing?.refundAmount)} · {t('admin_bookings_fee')}: {formatInr(b.cancellationDeduction ?? b.pricing?.cancellationDeduction)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                      <td className="py-3.5 px-4">{geotagStatus(b)}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={paymentVariant(b.paymentStatus)} size="sm">
                          {t(`admin_pay_${String(b.paymentStatus || 'PENDING').toLowerCase()}`, b.paymentStatus || 'PENDING')}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(b)}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> {t('admin_bookings_view_btn')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`${t('admin_bookings_detail_title')} ${selectedBooking.id}`}
          description={`${t('admin_bookings_date')}: ${selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString() : selectedBooking.date}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold uppercase text-[10px] text-emerald-800">{t('admin_bookings_status_label')}</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{t(`admin_status_${String(selectedBooking.status || '').toLowerCase()}`, selectedBooking.status)}</p>
              </div>
              <Badge variant="protected" size="sm">{t('common_coop_protected')}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">{t('admin_bookings_customer')}</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedBooking.customerName}</p>
                <p className="text-slate-500">{selectedBooking.customerPhone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">{t('admin_bookings_provider')}</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedBooking.providerName}</p>
                <p className="text-slate-500">{selectedBooking.providerSkill}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">{t('admin_bookings_address')}</span>
              <p className="font-medium text-slate-800">{selectedBooking.address || t('profile_location_unset')}</p>
              {selectedBooking.notes && (
                <p className="text-[11px] text-slate-500 italic mt-1">{selectedBooking.notes}</p>
              )}
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between"><span>{t('admin_bookings_total')}</span><strong>{formatInr(selectedBooking.pricing?.customerTotal)}</strong></div>
              <div className="flex justify-between"><span>{t('admin_bookings_upfront')}</span><strong>{formatInr(selectedBooking.pricing?.upfrontPayable)}</strong></div>
              <div className="flex justify-between"><span>{t('payment_worker_earnings')}</span><strong>{formatInr(selectedBooking.pricing?.workerEarnings)}</strong></div>
              <div className="flex justify-between"><span>{t('payment_platform_operations')}</span><strong>{formatInr(selectedBooking.pricing?.platformFee ?? selectedBooking.pricing?.platformOperations)}</strong></div>
              {selectedBooking.status === 'CANCELLED' && (
                <>
                  <div className="flex justify-between text-amber-800"><span>{t('admin_bookings_fee')}</span><strong>{formatInr(selectedBooking.cancellationDeduction ?? selectedBooking.pricing?.cancellationDeduction)}</strong></div>
                  <div className="flex justify-between text-emerald-800"><span>{t('admin_bookings_refund')}</span><strong>{formatInr(selectedBooking.refundAmount ?? selectedBooking.pricing?.refundAmount)}</strong></div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                {t('admin_bookings_close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
