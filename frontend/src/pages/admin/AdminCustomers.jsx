import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { LoadingState } from '../../components/common/LoadingState';
import { Users, Search, Gift, MapPin, Calendar } from 'lucide-react';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCust = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminCustomers();
        if (res.success) setCustomers(res.customers);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCust();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading customer directory..." />;
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory & Community Engagement"
        description="Monitor household user activity, loyalty reward balances, and service satisfaction scores."
        breadcrumbs={['Home', 'Admin', 'Customers']}
        badge={
          <Badge variant="coop" size="sm">
            {customers.length} Registered Households
          </Badge>
        }
      />

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, email, or area..."
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
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone & Email</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Total Bookings</th>
                <th className="py-3.5 px-4">Co-op Points</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size="sm" isVerified={true} />
                      <span className="font-bold text-slate-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{c.phone}</p>
                    <p className="text-[10px] text-slate-400">{c.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{c.location}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.totalBookings} Orders</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {c.rewardPoints} Pts
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{c.joinedDate}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success" size="sm">{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
