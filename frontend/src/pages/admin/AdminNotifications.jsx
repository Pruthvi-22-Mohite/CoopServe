import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Bell,
  ShieldCheck,
  Users,
  CalendarCheck,
  AlertTriangle,
  Check
} from 'lucide-react';

export const AdminNotifications = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([
    {
      id: 'an_1',
      title: 'New Service Provider Application',
      message: 'Rajesh Pawar submitted electrician certification for Shivajinagar & Deccan zones.',
      type: 'VERIFICATION',
      time: '10 mins ago',
      read: false
    },
    {
      id: 'an_2',
      title: 'Active Cooperative Milestone',
      message: '128 active verified gig professionals registered on CoopServe platform in Pune.',
      type: 'COOP_MEMBERS',
      time: '1 hour ago',
      read: false
    },
    {
      id: 'an_3',
      title: 'Algorithmic Fair Balancing Trigger',
      message: 'Smart matching rebalanced dispatch priority to Amit Patil due to lower weekly queue.',
      type: 'MATCHING',
      time: '3 hours ago',
      read: true
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_notif_title')}
        description={t('admin_notif_desc')}
        breadcrumbs={['Home', 'Admin', 'Notifications']}
        actions={
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            {t('admin_notif_mark_all_read')}
          </Button>
        }
      />

      <div className="space-y-3 max-w-4xl">
        {notifications.map((n) => (
          <Card key={n.id} className={`p-4 flex items-start justify-between gap-4 transition-all ${!n.read ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white'}`}>
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs mt-0.5">
                {n.type === 'VERIFICATION' ? <Users className="w-4 h-4 text-emerald-600" /> : n.type === 'COOP_MEMBERS' ? <ShieldCheck className="w-4 h-4 text-teal-600" /> : <Bell className="w-4 h-4 text-indigo-600" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 block mt-1">{n.time}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
