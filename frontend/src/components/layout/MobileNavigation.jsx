import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  Briefcase,
  IndianRupee,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const MobileNavigation = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = user?.role || 'CUSTOMER';

  const customerTabs = [
    { to: '/customer/dashboard', label: t('nav_home'), icon: LayoutDashboard },
    { to: '/customer/services', label: t('nav_services'), icon: Search },
    { to: '/customer/bookings', label: t('nav_bookings'), icon: CalendarCheck },
    { to: '/cooperative', label: t('nav_cooperative'), icon: Sparkles }
  ];

  const providerTabs = [
    { to: '/provider/dashboard', label: t('nav_dashboard', 'Home'), icon: LayoutDashboard },
    { to: '/provider/jobs', label: t('worker_menu_jobs', 'Jobs'), icon: Briefcase },
    { to: '/provider/earnings', label: t('worker_menu_earnings', 'Earnings'), icon: IndianRupee },
    { to: '/cooperative', label: t('nav_cooperative', 'Co-op'), icon: Sparkles }
  ];

  const adminTabs = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/providers', label: 'Workers', icon: ShieldCheck },
    { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/admin/matching', label: 'AI Match', icon: Sparkles }
  ];

  const tabs = role === 'SERVICE_PROVIDER' ? providerTabs : role === 'ADMIN' ? adminTabs : customerTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
