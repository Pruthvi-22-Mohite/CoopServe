import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import {
  ShieldCheck,
  Star,
  Award,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';

export const AdminProviders = () => {
  const { showToast } = useToast();
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminProviders();
      if (res.success) {
        setProviders(res.providers);
      }
    } catch (err) {
      console.error('Error fetching admin providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggleVerification = async (provider) => {
    try {
      const newVerified = !provider.isVerified;
      const res = await api.updateAdminProviderStatus(provider.id, { isVerified: newVerified });
      if (res.success) {
        showToast(`${provider.name} verification status updated!`, 'success');
        await fetchProviders();
      }
    } catch (err) {
      showToast('Failed to update verification status', 'error');
    }
  };

  const handleToggleSuspend = async (provider) => {
    try {
      const newStatus = provider.status === 'Suspended' ? 'Active' : 'Suspended';
      const res = await api.updateAdminProviderStatus(provider.id, { status: newStatus });
      if (res.success) {
        showToast(`${provider.name} is now ${newStatus}!`, newStatus === 'Suspended' ? 'warning' : 'success');
        await fetchProviders();
      }
    } catch (err) {
      showToast('Failed to update provider status', 'error');
    }
  };

  const filteredProviders = providers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.skill.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.categories?.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <LoadingState message="Loading verified provider registry..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cooperative Service Provider Management"
        description="Verify technician credentials, review portable Trust Scores, inspect fair workload allocation, and manage member standing."
        breadcrumbs={['Home', 'Admin', 'Providers']}
        badge={
          <Badge variant="coop" size="sm">
            {providers.length} Total Registered
          </Badge>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search provider name, trade, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold">Trade:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">All Categories</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="cleaning">Cleaning</option>
            <option value="appliance">Appliance Repair</option>
            <option value="carpentry">Carpentry</option>
            <option value="gardening">Gardening</option>
          </select>
        </div>
      </div>

      {/* Providers Table Card */}
      <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Trade & Category</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Jobs & Net Earnings</th>
                <th className="py-3.5 px-4">Trust Score</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProviders.map((prov) => (
                <tr key={prov.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={prov.avatar} name={prov.name} size="sm" isVerified={prov.isVerified} />
                      <div>
                        <p className="font-bold text-slate-900">{prov.name}</p>
                        <p className="text-[10px] text-slate-400">{prov.coopMemberId || prov.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{prov.skill}</span>
                    <span className="text-[10px] text-slate-400 block">{prov.location}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {prov.isVerified ? (
                      <Badge variant="success" size="sm">✓ Verified</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Pending Review</Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {prov.rating || '4.88'}
                    </span>
                    <span className="text-[10px] text-slate-400">{prov.reviewsCount || 50} reviews</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-800">₹{prov.totalNetEarnings?.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block">{prov.completedJobs} completed</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                        {prov.trustScore || 94}
                      </div>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center text-[11px] font-semibold ${prov.isAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {prov.isAvailable ? '🟢 Online' : '⚪ Off Duty'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={prov.status === 'Suspended' ? 'danger' : 'success'} size="sm">
                      {prov.status || 'Active'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProvider(prov)}
                        title="View Full Record"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant={prov.isVerified ? 'outline' : 'success'}
                        size="sm"
                        onClick={() => handleToggleVerification(prov)}
                        title={prov.isVerified ? 'Revoke Verification' : 'Verify Credentials'}
                      >
                        {prov.isVerified ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button
                        variant={prov.status === 'Suspended' ? 'success' : 'danger'}
                        size="sm"
                        onClick={() => handleToggleSuspend(prov)}
                        title={prov.status === 'Suspended' ? 'Reactivate' : 'Suspend Account'}
                      >
                        {prov.status === 'Suspended' ? 'Reactivate' : 'Suspend'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <Modal
          isOpen={!!selectedProvider}
          onClose={() => setSelectedProvider(null)}
          title={`Provider Record: ${selectedProvider.name}`}
          description={`Cooperative Member ID: ${selectedProvider.coopMemberId || selectedProvider.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Avatar src={selectedProvider.avatar} name={selectedProvider.name} size="lg" isVerified={selectedProvider.isVerified} />
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedProvider.name}</h4>
                <p className="text-xs text-emerald-800 font-semibold">{selectedProvider.skill}</p>
                <p className="text-slate-500 mt-0.5">{selectedProvider.email} • {selectedProvider.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-sm">{selectedProvider.trustScore}/100</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Trust Score</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-sm">{selectedProvider.completedJobs}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Jobs Completed</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-emerald-800 text-sm">₹{selectedProvider.totalNetEarnings?.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Net Take-Home</span>
              </div>
            </div>

            {selectedProvider.bio && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">Technician Bio</span>
                <p className="text-slate-700 mt-0.5">{selectedProvider.bio}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedProvider(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
