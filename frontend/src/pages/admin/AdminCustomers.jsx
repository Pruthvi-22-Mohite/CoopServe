import React, { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAdminLiveRefresh } from '../../hooks/useAdminLiveRefresh';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { Search } from 'lucide-react';

export const AdminCustomers = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCust = useCallback(async () => {
    try {
      const res = await api.getAdminCustomers();
      if (res.success) {
        setCustomers(res.customers || []);
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

  useAdminLiveRefresh(fetchCust);

  if (isLoading) {
    return <LoadingState message={t('admin_customers_loading')} />;
  }

  if (error && customers.length === 0) {
    return <EmptyState title={t('admin_error_title')} description={error} />;
  }

  const filtered = customers.filter((c) =>
    [c.name, c.email, c.location, c.phone].join(' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_customers_title')}
        description={t('admin_customers_desc')}
        breadcrumbs={[t('nav_home'), t('role_admin_portal'), t('admin_nav_customers')]}
        badge={
          <Badge variant="coop" size="sm">
            {customers.length} {t('admin_stat_customers')}
          </Badge>
        }
      />

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('admin_customers_search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200/90 shadow-soft">
        {filtered.length === 0 ? (
          <EmptyState
            title={customers.length === 0 ? t('admin_customers_empty') : t('admin_customers_no_results')}
            className="m-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">{t('admin_customers_col_customer')}</th>
                  <th className="py-3.5 px-4">{t('admin_customers_col_contact')}</th>
                  <th className="py-3.5 px-4">{t('admin_customers_col_location')}</th>
                  <th className="py-3.5 px-4">{t('admin_customers_col_bookings')}</th>
                  <th className="py-3.5 px-4">{t('admin_customers_col_points')}</th>
                  <th className="py-3.5 px-4">{t('admin_customers_col_joined')}</th>
                  <th className="py-3.5 px-4">{t('admin_customers_col_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} size="sm" />
                        <span className="font-bold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{c.phone || t('admin_value_na')}</p>
                      <p className="text-[10px] text-slate-400">{c.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{c.location || t('profile_location_unset')}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.totalBookings} {t('admin_customers_orders')}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        {c.rewardPoints} {t('admin_customers_pts')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.joinedDate ? new Date(c.joinedDate).toLocaleDateString() : t('admin_value_na')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" size="sm">{t('admin_status_registered')}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
