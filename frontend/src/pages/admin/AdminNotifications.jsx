import React, { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAdminLiveRefresh } from '../../hooks/useAdminLiveRefresh';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  ShieldCheck,
  Users,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const AdminNotifications = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await api.getAdminNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
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

  useAdminLiveRefresh(fetchNotifs);

  const handleMarkAllRead = async () => {
    try {
      await api.markAdminNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      showToast(t('admin_notif_mark_all_read'), 'success');
    } catch (err) {
      showToast(err.message || 'Error updating notifications', 'error');
    }
  };

  if (isLoading) {
    return <LoadingState message={t('common_loading')} />;
  }

  if (error && notifications.length === 0) {
    return <EmptyState title={t('admin_error_title')} description={error} />;
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffMin = Math.round((now - d) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'VERIFICATION':
      case 'REGISTERED':
        return <Users className="w-4 h-4 text-emerald-600" />;
      case 'COMPLETED':
      case 'PAID':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'BOOKED':
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return <CalendarCheck className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_notif_title')}
        description={t('admin_notif_desc')}
        breadcrumbs={[t('nav_home'), t('role_admin_portal'), t('nav_notifications')]}
        badge={
          unreadCount > 0 ? (
            <Badge variant="warning" size="sm">
              {unreadCount} {t('nav_notifications')}
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              {t('common_loading') ? '' : `${notifications.length} ${t('nav_notifications')}`}
            </Badge>
          )
        }
        actions={
          unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              {t('admin_notif_mark_all_read')}
            </Button>
          )
        }
      />

      <div className="space-y-3 max-w-4xl">
        {notifications.length === 0 ? (
          <EmptyState
            title={t('admin_notif_empty')}
            description={t('admin_notif_desc')}
          />
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-all ${
                !n.read ? 'bg-emerald-50/40 border-emerald-200 shadow-xs' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs mt-0.5 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">
                      {n.titleKey ? t(n.titleKey, n.title) : n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {formatTime(n.createdAt || n.time)}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

