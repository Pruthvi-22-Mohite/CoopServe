import React, { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAdminLiveRefresh } from '../../hooks/useAdminLiveRefresh';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Star, Eye, Search } from 'lucide-react';

const formatInr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const AdminProviders = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [deactivationProvider, setDeactivationProvider] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deactivationError, setDeactivationError] = useState('');

  const fetchProviders = useCallback(async () => {
    try {
      const res = await api.getAdminProviders();
      if (res.success) {
        setProviders(res.providers || []);
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

  useAdminLiveRefresh(fetchProviders);

  const handleToggleVerification = async (provider) => {
    try {
      const res = await api.updateAdminProviderStatus(provider.id, { isVerified: !provider.isVerified });
      if (res.success) {
        showToast(t('admin_providers_verify_updated'), 'success');
        await fetchProviders();
      }
    } catch (err) {
      showToast(t('admin_providers_update_failed'), 'error');
    }
  };

  const handleToggleSuspend = async (provider) => {
    if (provider.status !== 'Suspended') {
      setDeactivationProvider(provider);
      setDeactivationReason('');
      setDeactivationError('');
      return;
    }

    try {
      const res = await api.updateAdminProviderStatus(provider.id, { status: 'Active' });
      if (res.success) {
        showToast(t('admin_providers_now_active'), 'success');
        await fetchProviders();
      }
    } catch (err) {
      showToast(t('admin_providers_update_failed'), 'error');
    }
  };

  const handleConfirmDeactivation = async () => {
    const trimmedReason = deactivationReason.trim();
    if (!trimmedReason) {
      setDeactivationError(t('admin_providers_reason_required'));
      return;
    }
    if (trimmedReason.length > 500) {
      setDeactivationError(t('admin_providers_reason_too_long'));
      return;
    }

    try {
      const res = await api.updateAdminProviderStatus(deactivationProvider.id, {
        status: 'Suspended',
        reason: trimmedReason
      });
      if (res.success) {
        showToast(t('admin_providers_now_suspended'), 'warning');
        setDeactivationProvider(null);
        setDeactivationReason('');
        setDeactivationError('');
        await fetchProviders();
      }
    } catch (err) {
      setDeactivationError(err?.message || t('admin_providers_update_failed'));
    }
  };

  const filteredProviders = providers.filter((p) => {
    const matchesSearch = [p.name, p.skill, p.location].join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (p.categories || []).includes(categoryFilter) || String(p.skill || '').toLowerCase().includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <LoadingState message={t('admin_providers_loading')} />;
  }

  if (error && providers.length === 0) {
    return <EmptyState title={t('admin_error_title')} description={error} />;
  }

  const tradeOptions = ['electrical', 'plumbing', 'cleaning', 'appliance', 'carpentry', 'gardening'];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_providers_title')}
        description={t('admin_providers_desc')}
        breadcrumbs={[t('nav_home'), t('role_admin_portal'), t('admin_nav_providers')]}
        badge={
          <Badge variant="coop" size="sm">
            {providers.length} {t('admin_stat_workers')}
          </Badge>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('admin_providers_search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold">{t('admin_providers_trade')}</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">{t('admin_providers_filter_all')}</option>
            {tradeOptions.map((trade) => (
              <option key={trade} value={trade}>{t(`admin_trade_${trade}`, trade)}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-soft">
        {filteredProviders.length === 0 ? (
          <EmptyState
            title={providers.length === 0 ? t('admin_providers_empty') : t('admin_providers_no_results')}
            className="m-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">{t('admin_providers_col_provider')}</th>
                  <th className="py-3.5 px-4">{t('admin_providers_col_trade')}</th>
                  <th className="py-3.5 px-4">{t('admin_providers_col_verified')}</th>
                  <th className="py-3.5 px-4">{t('admin_providers_col_rating')}</th>
                  <th className="py-3.5 px-4">{t('admin_providers_col_jobs')}</th>
                  <th className="py-3.5 px-4">{t('admin_providers_col_trust')}</th>
                  <th className="py-3.5 px-4">{t('admin_providers_col_duty')}</th>
                  <th className="py-3.5 px-4">{t('admin_providers_col_status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('admin_providers_col_actions')}</th>
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
                      <span className="font-semibold text-slate-800">{prov.skill || t('admin_value_na')}</span>
                      <span className="text-[10px] text-slate-400 block">{prov.location || t('profile_location_unset')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {prov.isVerified ? (
                        <Badge variant="success" size="sm">{t('admin_verified')}</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">{t('admin_pending_review')}</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {prov.rating > 0 ? prov.rating : t('admin_value_na')}
                      </span>
                      <span className="text-[10px] text-slate-400">{prov.reviewsCount || 0} {t('common_reviews')}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-800">{formatInr(prov.totalNetEarnings)}</span>
                      <span className="text-[10px] text-slate-400 block">{prov.completedJobs} {t('admin_status_completed').toLowerCase()}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                          {prov.trustScore || 0}
                        </div>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center text-[11px] font-semibold ${prov.isAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {prov.isAvailable ? t('admin_on_duty') : t('admin_off_duty')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={prov.status === 'Suspended' ? 'danger' : 'success'} size="sm">
                        {t(`admin_provider_status_${String(prov.status || 'Active').toLowerCase()}`, prov.status || 'Active')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProvider(prov)} title={t('admin_providers_view_btn')}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant={prov.isVerified ? 'outline' : 'success'}
                          size="sm"
                          onClick={() => handleToggleVerification(prov)}
                        >
                          {prov.isVerified ? t('admin_providers_verify_btn') : t('admin_providers_unverify_btn')}
                        </Button>
                        <Button
                          variant={prov.status === 'Suspended' ? 'success' : 'danger'}
                          size="sm"
                          onClick={() => handleToggleSuspend(prov)}
                        >
                          {prov.status === 'Suspended' ? t('admin_providers_activate_btn') : t('admin_providers_suspend_btn')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {deactivationProvider && (
        <Modal
          isOpen={!!deactivationProvider}
          onClose={() => {
            setDeactivationProvider(null);
            setDeactivationReason('');
            setDeactivationError('');
          }}
          title={`${t('admin_providers_deactivate_title')} — ${deactivationProvider.name}`}
          description={t('admin_providers_deactivate_desc')}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {t('admin_providers_deactivate_reason')}
              </label>
              <textarea
                value={deactivationReason}
                onChange={(event) => {
                  setDeactivationReason(event.target.value);
                  if (deactivationError) setDeactivationError('');
                }}
                rows={4}
                placeholder={t('admin_providers_reason_placeholder')}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {deactivationError && (
              <p className="text-xs text-red-600 font-medium">{deactivationError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeactivationProvider(null);
                  setDeactivationReason('');
                  setDeactivationError('');
                }}
              >
                {t('admin_providers_deactivate_cancel')}
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmDeactivation}>
                {t('admin_providers_deactivate_confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {selectedProvider && (
        <Modal
          isOpen={!!selectedProvider}
          onClose={() => setSelectedProvider(null)}
          title={`${t('admin_providers_detail_title')}: ${selectedProvider.name}`}
          description={`${t('prof_member_id')}: ${selectedProvider.coopMemberId || selectedProvider.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <Avatar src={selectedProvider.avatar} name={selectedProvider.name} size="lg" isVerified={selectedProvider.isVerified} />
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedProvider.name}</h4>
                <p className="text-xs text-emerald-800 font-semibold">{selectedProvider.skill}</p>
                <p className="text-slate-500 mt-0.5">{selectedProvider.email} · {selectedProvider.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-sm">{selectedProvider.trustScore || 0}/100</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t('admin_providers_col_trust')}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-sm">{selectedProvider.completedJobs}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t('admin_stat_completed')}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="font-bold text-emerald-800 text-sm">{formatInr(selectedProvider.totalNetEarnings)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{t('admin_earnings_stat_worker')}</span>
              </div>
            </div>
            {selectedProvider.status === 'Suspended' && selectedProvider.deactivationReason && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold uppercase tracking-wider text-[10px] block">{t('admin_providers_deactivate_reason')}</span>
                <p className="mt-1">{selectedProvider.deactivationReason}</p>
              </div>
            )}
            {selectedProvider.bio && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">{t('prof_about')}</span>
                <p className="text-slate-700 mt-0.5">{selectedProvider.bio}</p>
              </div>
            )}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedProvider(null)}>
                {t('admin_providers_close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
