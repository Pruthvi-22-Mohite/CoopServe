import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  CheckCircle2,
  Gift,
  ShieldCheck,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';

export const CustomerNotifications = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await api.getNotifications();
        if (res.success) {
          setNotifications(res.notifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.markNotificationRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        showToast('Notification marked as read', 'info');
      }
    } catch (err) {
      showToast('Failed to update notification', 'error');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'REWARDS':
        return <Gift className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return <LoadingState message="Loading your notifications..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav_notifications')}
        description="Stay updated with your service dispatch timings, cooperative rewards, and verified receipt records."
        breadcrumbs={['Home', 'Notifications']}
        badge={
          unreadCount > 0 ? (
            <Badge variant="danger" size="sm">
              {unreadCount} Unread
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              All Caught Up
            </Badge>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications right now"
          description="You will receive alerts here when your technician is assigned, on the way, or finishes a job."
        />
      ) : (
        <div className="space-y-3 max-w-4xl">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 transition-all flex items-start justify-between gap-4 ${
                !n.read ? 'bg-emerald-50/40 border-emerald-200 shadow-xs' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs shrink-0 mt-0.5">
                  {getNotifIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-100" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {!n.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(n.id)}
                  className="shrink-0 text-xs text-emerald-700 hover:bg-emerald-100"
                >
                  <Check className="w-3.5 h-3.5 mr-1" /> Mark Read
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
