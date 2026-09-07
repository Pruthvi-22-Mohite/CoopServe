import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
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
  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await api.getBookings();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await api.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        showToast(`Job status updated to ${newStatus.replace('_', ' ')}!`, 'success');
        await fetchJobs();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update job status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGeotagVerification = async (booking, targetStatus, stage) => {
    if (!navigator.geolocation) {
      showToast('This device does not support GPS-based verification.', 'error');
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
            showToast(res.message || 'Geolocation verification failed. Please move closer to the service location.', 'error');
            return;
          }

          showToast(res.message || 'Location verified successfully.', 'success');
          await handleUpdateStatus(booking.id, targetStatus);
        } catch (err) {
          showToast(err.message || 'Unable to verify your GPS location.', 'error');
        }
      },
      () => {
        showToast('Location access was denied. Please enable GPS to continue the job.', 'error');
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
        return <Badge variant="success" size="sm">✓ Completed</Badge>;
      case 'BOOKED':
        return <Badge variant="warning" size="sm">Pending Request</Badge>;
      case 'PROVIDER_ACCEPTED':
      case 'ACCEPTED':
        return <Badge variant="info" size="sm">Accepted</Badge>;
      case 'ON_THE_WAY':
        return <Badge variant="primary" size="sm">On The Way</Badge>;
      case 'ARRIVED':
        return <Badge variant="coop" size="sm">Arrived at Site</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'CANCELLED':
      case 'REJECTED':
        return <Badge variant="danger" size="sm">{status}</Badge>;
      default:
        return <Badge variant="protected" size="sm">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading assigned job requests..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Service Jobs & Dispatches"
        description="Review customer booking requests, dispatch appointments, and complete jobs with CoopServe Protected 90% direct earnings."
        breadcrumbs={['Home', 'Jobs']}
        badge={
          <Badge variant="coop" size="sm">
            {bookings.length} Total Jobs
          </Badge>
        }
      />

      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Jobs ({bookings.length})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'pending'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Requests ({bookings.filter((b) => b.status === 'BOOKED').length})
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Dispatches ({bookings.filter((b) => ['PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status)).length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed History ({bookings.filter((b) => b.status === 'COMPLETED').length})
        </button>
      </div>

      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found in this view"
          description="New service booking requests assigned to you will appear here immediately."
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
                      CoopServe Protected
                    </Badge>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{job.serviceTitle}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                    <span>
                      Customer: <strong className="text-slate-900">{job.customerName}</strong> ({job.customerPhone})
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
                      Customer Note: "{job.notes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Net Payout (90%)</span>
                    <span className="text-lg font-black text-emerald-800">₹{job.pricing?.workerEarnings || 440}</span>
                    <span className="text-[10px] text-slate-500 block">Customer Paid: ₹{job.pricing?.customerPayment || 500}</span>
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
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={updatingId === job.id}
                          onClick={() => handleUpdateStatus(job.id, 'PROVIDER_ACCEPTED')}
                          rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Accept Job
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
                        Mark On The Way
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
                        Mark Arrived at Site
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
                        Start Service
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
                        Complete Job & Settle
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
