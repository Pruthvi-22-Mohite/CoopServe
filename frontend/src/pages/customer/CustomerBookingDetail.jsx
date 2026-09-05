import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ChatModal } from '../../components/common/ChatModal';
import { LoadingState } from '../../components/common/LoadingState';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  Phone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  Share2,
  MessageSquare
} from 'lucide-react';

export const CustomerBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('My schedule changed');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true);
      try {
        const res = await api.getBookingById(id);
        if (res.success && res.booking) {
          setBooking(res.booking);
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
        showToast('Booking details not found', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      const res = await api.cancelBooking(id, cancelReason);
      if (res.success) {
        setBooking(res.booking);
        setShowCancelModal(false);
        showToast('Booking cancelled. Protected guarantee removed.', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading order details..." />;
  }

  if (!booking) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-bold text-slate-800">Booking record not found</h3>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/customer/bookings')}>
          Back to Bookings
        </Button>
      </div>
    );
  }

  const isRejected = booking.status === 'REJECTED' || booking.status === 'DECLINED';
  const isCancelled = booking.status === 'CANCELLED';
  const isCompleted = booking.status === 'COMPLETED';

  const steps = [
    { key: 'BOOKED', label: 'Order Confirmed', time: 'Completed' },
    { key: 'PROVIDER_ACCEPTED', label: 'Pro Accepted', time: isCompleted || ['PROVIDER_ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status) ? 'Completed' : 'Pending' },
    { key: 'ON_THE_WAY', label: 'On The Way', time: ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'Completed' : 'Pending' },
    { key: 'ARRIVED', label: 'Arrived at Site', time: ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'Completed' : 'Pending' },
    { key: 'IN_PROGRESS', label: 'Service In Progress', time: ['IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'Completed' : 'Pending' },
    { key: 'COMPLETED', label: 'Service Completed', time: isCompleted ? 'Completed' : 'Pending' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'BOOKED': return 0;
      case 'PROVIDER_ACCEPTED':
      case 'ACCEPTED': return 1;
      case 'ON_THE_WAY': return 2;
      case 'ARRIVED': return 3;
      case 'IN_PROGRESS': return 4;
      case 'COMPLETED': return 5;
      default: return -1;
    }
  };

  const currentStepIdx = getStepIndex(booking.status);

  const getHeaderBadge = () => {
    if (isCompleted) return <Badge variant="success" size="sm">✓ Completed</Badge>;
    if (isCancelled) return <Badge variant="danger" size="sm">Cancelled by Customer</Badge>;
    if (isRejected) return <Badge variant="danger" size="sm">Declined by Provider</Badge>;
    if (booking.status === 'IN_PROGRESS') return <Badge variant="warning" size="sm">In Progress</Badge>;
    if (booking.status === 'ARRIVED') return <Badge variant="info" size="sm">Arrived at Site</Badge>;
    if (booking.status === 'ON_THE_WAY') return <Badge variant="info" size="sm">On The Way</Badge>;
    if (booking.status === 'PROVIDER_ACCEPTED' || booking.status === 'ACCEPTED') return <Badge variant="success" size="sm">Pro Accepted</Badge>;
    return <Badge variant="protected" size="sm">Order Confirmed</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/customer/bookings')}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          title={`Booking ${booking.id}`}
          description={`Protected service ordered on ${new Date(booking.createdAt).toLocaleDateString()}`}
          breadcrumbs={['Home', 'Bookings', booking.id]}
          badge={getHeaderBadge()}
          className="mb-0 pb-0 border-b-0"
        />
      </div>

      {/* Real-Time Visual Status Timeline / Rejection Resolution Banner */}
      <Card className="p-6 bg-white border border-slate-200/90 shadow-soft">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Service Status & Progress</h3>

        {isCancelled ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
            <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-bold">This booking was cancelled by customer.</p>
              <p className="text-rose-600 mt-0.5">Reason: {booking.cancellationReason || 'Schedule change'}</p>
            </div>
          </div>
        ) : isRejected ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-amber-300 text-amber-950 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-700 mt-0.5">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-extrabold text-amber-950">Job Request Declined by Provider</h4>
                    <Badge variant="danger" size="sm">Provider Unavailable</Badge>
                  </div>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    <strong>{booking.providerName}</strong> was unable to accept this request due to a schedule conflict or duty status.
                  </p>
                </div>
              </div>
            </div>

            {/* Protected Guarantee Assurance Card */}
            <div className="p-3.5 bg-white/95 rounded-xl border border-amber-200 text-xs space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>CoopServe 100% Protection Guarantee Active</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Your payment of <strong>₹{booking.price || booking.pricing?.customerPayment || 500}</strong> is 100% protected. Zero cancellation charges apply. You can instantly match with another verified cooperative provider or request an auto-refund.
              </p>
            </div>

            {/* 1-Click Resolution CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/customer/providers?category=${booking.category || 'all'}`)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Find Another Provider (AI Match)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/customer/services')}
              >
                Explore Services
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/customer/bookings')}
              >
                Back to Bookings
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
            {steps.map((step, idx) => {
              const isDone = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-emerald-700' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Service Info, Provider Info, Address */}
        <div className="lg:col-span-8 space-y-6">
          {/* Assigned Technician Card */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Assigned Cooperative Professional</h3>
              <Badge variant="coop" size="sm">Trust Score: {booking.providerTrustScore || 94}/100</Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={booking.providerAvatar}
                  name={booking.providerName}
                  size="lg"
                  isVerified={true}
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900">{booking.providerName}</h4>
                  <p className="text-xs font-semibold text-emerald-800">{booking.providerSkill}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{booking.providerPhone}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/customer/provider/${booking.providerId}`)}
                >
                  View Profile
                </Button>
                {!isRejected && !isCancelled && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                      onClick={() => setShowChatModal(true)}
                    >
                      Live Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Phone className="w-3.5 h-3.5" />}
                      onClick={() => showToast(`Calling ${booking.providerName}...`, 'info')}
                    >
                      Call Pro
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Job Details & Address */}
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Service Appointment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Service Title</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{booking.serviceTitle}</p>
              </div>

              <div>
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Scheduled Slot</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{booking.date} at {booking.time}</p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-400 font-medium block uppercase text-[10px]">Service Address</span>
                <p className="font-semibold text-slate-800 text-xs mt-0.5 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{booking.address}</span>
                </p>
              </div>

              {booking.notes && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Customer Notes</span>
                  <p className="text-xs text-slate-700 mt-0.5">{booking.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Transparent Payment & Receipts */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-gradient-to-b from-white to-emerald-50/30 border border-emerald-200 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Protected Receipt</span>
              </div>
              <Badge variant="success" size="sm">PAID</Badge>
            </div>

            {/* Transparent Fee Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Service Price</span>
                <span className="font-semibold text-slate-900">₹{booking.pricing?.basePrice || 400}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Distance Travel Fee ({booking.pricing?.distanceKm || 3.2} km)</span>
                <span className="font-semibold text-slate-900">₹{booking.pricing?.travelFee !== undefined ? booking.pricing.travelFee : 20}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Extra Charges</span>
                <span className="font-semibold text-slate-900">₹{booking.pricing?.extraCharges || 0}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount Paid</span>
                <span className="text-emerald-700">₹{booking.pricing?.customerTotal || booking.pricing?.customerPayment || 420}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-500">
                <div className="flex justify-between">
                  <span>Worker Earnings (90%)</span>
                  <span className="font-bold text-emerald-800">₹{booking.pricing?.workerEarnings || 378}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Operations (10%)</span>
                  <span className="font-medium text-slate-700">₹{booking.pricing?.platformFee || booking.pricing?.platformOperations || 42}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 space-y-1">
              <p>Txn ID: <strong>{booking.transactionId || 'CS-TXN-984214'}</strong></p>
              <p>Method: <strong>{booking.paymentMethod || 'UPI (Mock)'}</strong></p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => showToast('Downloading digital receipt PDF...', 'info')}
            >
              Download PDF Receipt
            </Button>

            {isRejected ? (
              <div className="pt-2 text-center text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                100% Refund / Re-match Eligible
              </div>
            ) : booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full text-center text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline pt-2"
              >
                Cancel Service Booking
              </button>
            )}
          </Card>
        </div>
      </div>

      {/* Cancellation Friction Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Protected Booking?"
        description="Please review what happens when cancelling on CoopServe."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Notice of Protection Removal</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Your provider <strong>{booking.providerName}</strong> has already been scheduled. Cancelling this booking will remove your CoopServe protection, digital service record, and 30-day warranty guarantee.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Reason for Cancellation
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="My schedule changed">My schedule changed</option>
              <option value="Issue resolved on my own">Issue resolved on my own</option>
              <option value="Booked wrong service category">Booked wrong service category</option>
              <option value="Other emergency">Other personal emergency</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Protected Booking
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleCancelBooking}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Live In-App Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        booking={booking}
      />
    </div>
  );
};
