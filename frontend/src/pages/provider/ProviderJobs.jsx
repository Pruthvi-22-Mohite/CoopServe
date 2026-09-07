import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { subscribeToBookingUpdates } from '../../services/socket';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Briefcase,
  MapPin,
  CheckCircle2,
  Truck,
  PlayCircle,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const ProviderJobs = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await api.getBookings();
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Subscribe to scoped Socket.IO events for real-time dispatch and status updates
    const unsubscribe = subscribeToBookingUpdates(
      () => {
        fetchJobs();
      },
      () => {
        fetchJobs();
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await api.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        showToast(
          t('worker_job_status_updated', `Job status updated to ${newStatus.replace('_', ' ')}!`),
          'success'
        );
        await fetchJobs();
      }
    } catch (err) {
      showToast(err.message || t('worker_job_status_failed', 'Failed to update job status'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGeotagVerification = async (booking, targetStatus, stage) => {
    if (!navigator.geolocation) {
      showToast(t('worker_gps_not_supported', 'This device does not support GPS-based verification.'), 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await api.verifyBookingLocation(booking.id, {
            stage,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });

          if (!res.success || !res.verified) {
            showToast(res.message || t('worker_gps_failed', 'Geolocation verification failed. Please move closer to the service location.'), 'error');
            return;
          }

          showToast(res.message || t('worker_gps_success', 'Location verified successfully.'), 'success');
          await handleUpdateStatus(booking.id, targetStatus);
        } catch (err) {
          showToast(err.message || t('worker_gps_failed', 'Unable to verify your GPS location.'), 'error');
        }
      },
      () => {
        showToast(t('worker_gps_denied', 'Location access was denied. Please enable GPS to continue the job.'), 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const filteredJobs = bookings.filter((b) => {
    if (activeFilter === 'pending') return b.status === 'BOOKED';
    if (activeFilter === 'active') return ['PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status);
    if (activeFilter === 'completed') return b.status === 'COMPLETED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" size="sm">{t('worker_status_completed', '✓ Completed')}</Badge>;
      case 'BOOKED':
        return <Badge variant="warning" size="sm">{t('worker_status_booked', 'Pending Request')}</Badge>;
      case 'PROVIDER_ACCEPTED':
      case 'ACCEPTED':
        return <Badge variant="info" size="sm">{t('worker_status_accepted', 'Accepted')}</Badge>;
      case 'ON_THE_WAY':
        return <Badge variant="primary" size="sm">{t('worker_status_on_the_way', 'On The Way')}</Badge>;
      case 'ARRIVED':
        return <Badge variant="coop" size="sm">{t('worker_status_arrived', 'Arrived at Site')}</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" size="sm">{t('worker_status_in_progress', 'In Progress')}</Badge>;
      case 'CANCELLED':
      case 'REJECTED':
        return <Badge variant="danger" size="sm">{status}</Badge>;
      default:
        return <Badge variant="protected" size="sm">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingState message={t('worker_loading_jobs', 'Loading assigned job requests...')} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('worker_jobs_page_title', 'Assigned Service Jobs & Dispatches')}
        description={t(
          'worker_jobs_page_desc',
          'Review customer booking requests, dispatch appointments, and complete jobs with CoopServe Protected 90% direct earnings.'
        )}
        breadcrumbs={[t('nav_dashboard', 'Home'), t('worker_menu_jobs', 'Jobs')]}
        badge={
          <Badge variant="coop" size="sm">
            {bookings.length} {t('worker_total_jobs_badge', 'Total Jobs')}
          </Badge>
        }
      />

      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('worker_all_jobs_tab', 'All Jobs')} ({bookings.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'pending'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('worker_pending_requests_tab', 'Pending Requests')} ({bookings.filter((b) => b.status === 'BOOKED').length})
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('worker_active_dispatches_tab', 'Active Dispatches')} ({bookings.filter((b) => ['PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('worker_completed_history_tab', 'Completed History')} ({bookings.filter((b) => b.status === 'COMPLETED').length})
        </button>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t('worker_no_jobs_view_title', 'No jobs found in this view')}
          description={t(
            'worker_no_jobs_view_desc',
            'New service booking requests assigned to you will appear here immediately.'
          )}
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-5 border border-slate-200/90 shadow-soft space-y-4 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">ID: {job.id}</span>
                    {getStatusBadge(job.status)}
                    <Badge variant="protected" size="sm">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {t('worker_badge_protected', 'CoopServe Protected')}
                    </Badge>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{job.serviceTitle}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                    <span>
                      {t('worker_customer_label', 'Customer')}: <strong className="text-slate-900">{job.customerName}</strong> ({job.customerPhone})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {job.date} at {job.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {job.address}
                    </span>
                  </div>

                  {job.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1">
                      {t('worker_customer_label', 'Customer')} Note: "{job.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {t('worker_your_net_payout_label', 'Your Net Payout (90%)')}
                    </span>
                    <span className="text-lg font-black text-emerald-800">₹{job.pricing?.workerEarnings ?? 0}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {t('worker_customer_paid_small', 'Customer Paid: ₹{amount}').replace('{amount}', job.pricing?.customerPayment || 500)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {job.status === 'BOOKED' && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={updatingId === job.id}
                          onClick={() => handleUpdateStatus(job.id, 'REJECTED')}
                        >
                          {t('worker_decline_btn', 'Decline')}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={updatingId === job.id}
                          onClick={() => handleUpdateStatus(job.id, 'PROVIDER_ACCEPTED')}
                          rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          {t('worker_accept_job_plain', 'Accept Job')}
                        </Button>
                      </>
                    )}

                    {job.status === 'PROVIDER_ACCEPTED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={updatingId === job.id}
                        onClick={() => handleUpdateStatus(job.id, 'ON_THE_WAY')}
                        leftIcon={<Truck className="w-3.5 h-3.5" />}
                      >
                        {t('worker_action_on_the_way', 'Mark On The Way')}
                      </Button>
                    )}

                    {job.status === 'ON_THE_WAY' && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={updatingId === job.id}
                        onClick={() => handleUpdateStatus(job.id, 'ARRIVED')}
                        leftIcon={<MapPin className="w-3.5 h-3.5" />}
                      >
                        {t('worker_action_arrived', 'Mark Arrived at Site')}
                      </Button>
                    )}

                    {job.status === 'ARRIVED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={updatingId === job.id}
                        onClick={() => handleGeotagVerification(job, 'IN_PROGRESS', 'start')}
                        leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
                      >
                        {t('worker_action_start_job', 'Start Service')}
                      </Button>
                    )}

                    {job.status === 'IN_PROGRESS' && (
                      <Button
                        variant="coop"
                        size="sm"
                        isLoading={updatingId === job.id}
                        onClick={() => handleGeotagVerification(job, 'COMPLETED', 'completion')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        {t('worker_complete_job_settle', 'Complete Job & Settle')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
