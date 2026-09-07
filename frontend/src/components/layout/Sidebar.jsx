import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  Sparkles,
  Briefcase,
  Clock,
  IndianRupee,
  ShieldCheck,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Award,
  Users,
  Bell,
  User,
  Star
} from 'lucide-react';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = user?.role || 'CUSTOMER';

  const customerLinks = [
    { to: '/customer/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { to: '/customer/services', label: t('nav_services'), icon: Search },
    { to: '/customer/providers', label: t('nav_verified_providers'), icon: Users },
    { to: '/customer/bookings', label: t('nav_bookings'), icon: CalendarCheck },
    { to: '/customer/notifications', label: t('nav_notifications'), icon: Bell },
    { to: '/customer/profile', label: t('nav_profile'), icon: User },
    { to: '/cooperative', label: t('nav_cooperative'), icon: Sparkles, highlight: true }
  ];

  const providerLinks = [
    { to: '/provider/dashboard', label: 'Worker Dashboard', icon: LayoutDashboard },
    { to: '/provider/jobs', label: 'Assigned Jobs', icon: Briefcase },
    { to: '/provider/earnings', label: 'Net Earnings (90%)', icon: IndianRupee },
    { to: '/provider/availability', label: 'Duty & Localities', icon: Clock },
    { to: '/provider/history', label: 'Verified Work Record', icon: Award },
    { to: '/provider/reviews', label: 'Ratings & Reviews', icon: Star },
    { to: '/provider/cooperative', label: 'Cooperative Safety Net', icon: Sparkles, highlight: true },
    { to: '/provider/notifications', label: 'Dispatch Alerts', icon: Bell },
    { to: '/provider/profile', label: 'My Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/providers', label: 'Provider Management', icon: ShieldCheck },
    { to: '/admin/customers', label: 'Customer Directory', icon: Users },
    { to: '/admin/bookings', label: 'All Bookings', icon: CalendarCheck },
    { to: '/admin/matching', label: 'AI Matching Inspector', icon: Cpu, badge: 'Fair Algo' },
    { to: '/admin/earnings', label: 'Financial Analytics', icon: IndianRupee },
    { to: '/admin/reports', label: 'Cancellation & Leakage', icon: AlertTriangle },
    { to: '/cooperative', label: 'Cooperative Governance', icon: Sparkles, highlight: true },
    { to: '/admin/notifications', label: 'System Alerts', icon: Bell },
    { to: '/admin/settings', label: 'Platform Settings', icon: TrendingUp }
  ];

  const getLinks = () => {
    switch (role) {
      case 'SERVICE_PROVIDER': return providerLinks;
      case 'ADMIN': return adminLinks;
      case 'CUSTOMER':
      default: return customerLinks;
    }
  };

  const navLinks = getLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Active Role Label */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('layout_portal_view')}</p>
            <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
              {role === 'ADMIN' ? '🛡️ Cooperative Admin' : role === 'SERVICE_PROVIDER' ? '⚡ Worker / Service Partner' : '🏠 Household Customer'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs font-bold'
                        : item.highlight
                        ? 'text-teal-700 hover:bg-teal-50/60 font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.highlight ? 'text-teal-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Cooperative Guarantee Pill in Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-emerald-50/40 m-3 rounded-2xl border">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('common_guarantee_title')}</span>
          </div>
          <p className="text-[11px] text-emerald-700/90 leading-tight">
            {t('common_guarantee_description')}
          </p>
        </div>
      </aside>
    </>
  );
};
