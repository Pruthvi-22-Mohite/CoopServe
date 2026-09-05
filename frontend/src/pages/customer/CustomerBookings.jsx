import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const CustomerBookings = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'completed'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await api.getBookings();
        if (res.success) {
          setBookings(res.bookings);
        }
      } catch (err) {
        console.error('Error loading bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'active') return !['COMPLETED', 'CANCELLED', 'REJECTED', 'DECLINED'].includes(b.status);
    if (activeFilter === 'completed') return b.status === 'COMPLETED';
    if (activeFilter === 'declined') return ['CANCELLED', 'REJECTED', 'DECLINED'].includes(b.status);
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" size="sm">✓ Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" size="sm">Cancelled by Customer</Badge>;
      case 'REJECTED':
      case 'DECLINED':
        return <Badge variant="danger" size="sm">Declined by Provider</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'ARRIVED':
        return <Badge variant="info" size="sm">Arrived at Site</Badge>;
      case 'ON_THE_WAY':
        return <Badge variant="info" size="sm">On The Way</Badge>;
      case 'PROVIDER_ACCEPTED':
      case 'ACCEPTED':
        return <Badge variant="success" size="sm">Pro Accepted</Badge>;
      case 'BOOKED':
      default:
        return <Badge variant="protected" size="sm">Order Confirmed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav_bookings')}
        description="Track your real-time household service orders, digital payment receipts, and CoopServe Protection guarantees."
        breadcrumbs={['Home', 'Bookings']}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/customer/services')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            New Service Booking
          </Button>
        }
      />

      {/* Filter Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active / In Progress ({bookings.filter(b => !['COMPLETED', 'CANCELLED', 'REJECTED', 'DECLINED'].includes(b.status)).length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed History ({bookings.filter(b => b.status === 'COMPLETED').length})
        </button>
        <button
          onClick={() => setActiveFilter('declined')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'declined'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Declined / Cancelled ({bookings.filter(b => ['CANCELLED', 'REJECTED', 'DECLINED'].includes(b.status)).length})
        </button>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <LoadingState message="Loading your service orders..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found in this view"
          description="Schedule a certified electrician, plumber, cleaner, or technician with Protected Booking guarantee."
          actionLabel="Book a Service Now"
          onAction={() => navigate('/customer/services')}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              hoverable
              onClick={() => navigate(`/customer/booking/${booking.id}`)}
              className="p-5 border border-slate-200/90 group transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Side: Booking Details & Provider Avatar */}
                <div className="flex items-start gap-4">
                  <Avatar
                    src={booking.providerAvatar}
                    name={booking.providerName}
                    size="lg"
                    isVerified={true}
                  />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">ID: {booking.id}</span>
                      {getStatusBadge(booking.status)}
                      <Badge variant="protected" size="sm">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        CoopServe Protected
                      </Badge>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {booking.serviceTitle}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium">
                      Assigned Pro: <strong className="text-slate-900">{booking.providerName}</strong> ({booking.providerSkill})
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" /> {booking.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {booking.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Price Split & View Button */}
                <div className="flex items-center justify-between lg:justify-end gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Protected Total</span>
                    <span className="text-lg font-black text-slate-900">₹{booking.pricing?.customerTotal || booking.pricing?.customerPayment || 420}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      Paid via {booking.paymentMethod} • ₹{booking.pricing?.workerEarnings || 378} Net
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {['REJECTED', 'DECLINED'].includes(booking.status) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/providers?category=${booking.category || 'all'}`);
                        }}
                      >
                        Re-match Pro
                      </Button>
                    )}
                    <Button
                      variant={['REJECTED', 'DECLINED'].includes(booking.status) ? 'outline' : 'primary'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customer/booking/${booking.id}`);
                      }}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View Details & Receipt
                    </Button>
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
