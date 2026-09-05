import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import {
  CalendarCheck,
  Search,
  Eye,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await api.getBookings();
        if (res.success) setBookings(res.bookings);
      } catch (err) {
        console.error('Error fetching admin bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading platform service bookings ledger..." />;
  }

  const filtered = bookings.filter(b =>
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return <Badge variant="success" size="sm">Completed</Badge>;
      case 'CANCELLED': return <Badge variant="danger" size="sm">Cancelled</Badge>;
      case 'IN_PROGRESS': return <Badge variant="warning" size="sm">In Progress</Badge>;
      case 'ON_THE_WAY': return <Badge variant="info" size="sm">On The Way</Badge>;
      case 'PROVIDER_ACCEPTED': return <Badge variant="primary" size="sm">Accepted</Badge>;
      case 'BOOKED':
      default: return <Badge variant="protected" size="sm">Confirmed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Service Bookings & Transaction Ledger"
        description="Inspect real-time booking statuses, transparent 88/6/6 price distributions, and customer satisfaction."
        breadcrumbs={['Home', 'Admin', 'Bookings']}
        badge={
          <Badge variant="coop" size="sm">
            {bookings.length} Total Bookings
          </Badge>
        }
      />

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, customer, pro, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">Booking ID</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Assigned Pro</th>
                <th className="py-3.5 px-4">Slot</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Service Status</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => (
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
                  <td className="py-3.5 px-4 text-slate-500">{b.date} at {b.time}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">₹{b.pricing?.customerTotal || b.pricing?.customerPayment || 420}</span>
                    <span className="text-[10px] text-emerald-700 block">Worker Net: ₹{b.pricing?.workerEarnings || 378}</span>
                    {b.pricing?.travelFee > 0 && (
                      <span className="text-[9px] text-teal-600 block">+{b.pricing?.travelFee} travel ({b.pricing?.distanceKm || 3.2}km)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success" size="sm">{b.paymentStatus || 'PAID'}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking ${selectedBooking.id}`}
          description={`Registered on ${new Date(selectedBooking.createdAt).toLocaleDateString()}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold uppercase text-[10px] text-emerald-800">Status</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{selectedBooking.status}</p>
              </div>
              <Badge variant="protected" size="sm">CoopServe Protected</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Customer</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedBooking.customerName}</p>
                <p className="text-slate-500">{selectedBooking.customerPhone}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Pro</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedBooking.providerName}</p>
                <p className="text-slate-500">{selectedBooking.providerSkill}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Service Location</span>
              <p className="font-medium text-slate-800">{selectedBooking.address}</p>
              {selectedBooking.notes && (
                <p className="text-[11px] text-slate-500 italic mt-1">Note: "{selectedBooking.notes}"</p>
              )}
            </div>

            {/* Price Split & Distance Fee Full Audit */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Transparent Pricing Breakdown</span>
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Base Service Price</span>
                  <span className="font-semibold text-slate-900">₹{selectedBooking.pricing?.basePrice || 400}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance ({selectedBooking.pricing?.distanceKm || 3.2} km) Travel Fee</span>
                  <span className="font-semibold text-teal-800">+₹{selectedBooking.pricing?.travelFee !== undefined ? selectedBooking.pricing.travelFee : 20}</span>
                </div>
                <div className="flex justify-between">
                  <span>Extra Work / Material Charges</span>
                  <span className="font-semibold text-slate-900">₹{selectedBooking.pricing?.extraCharges || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Operations Fee (10%)</span>
                  <span className="font-semibold text-slate-800">₹{selectedBooking.pricing?.platformFee || selectedBooking.pricing?.platformOperations || 42}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Worker Net Payout (90%)</span>
                  <span className="font-bold text-emerald-900">₹{selectedBooking.pricing?.workerEarnings || 378}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Final Customer Total</span>
                  <span className="text-emerald-700 font-black text-sm">₹{selectedBooking.pricing?.customerTotal || selectedBooking.pricing?.customerPayment || 420}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
