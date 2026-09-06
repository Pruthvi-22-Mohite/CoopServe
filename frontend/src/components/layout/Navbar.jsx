import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import {
  ShieldCheck,
  Bell,
  LogOut,
  User,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Globe,
  Glasses
} from 'lucide-react';

export const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const { isElderlyMode, toggleAccessibilityMode } = useAccessibility();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SERVICE_PROVIDER':
        return <Badge variant="coop" size="sm">Worker / Provider</Badge>;
      case 'ADMIN':
        return <Badge variant="danger" size="sm">Admin Portal</Badge>;
      case 'CUSTOMER':
      default:
        return <Badge variant="protected" size="sm">Customer</Badge>;
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SERVICE_PROVIDER': return '/provider/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      case 'CUSTOMER':
      default: return '/customer/dashboard';
    }
  };

  const currentLangObj = availableLanguages.find(l => l.code === language) || availableLanguages[0];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to={getDashboardLink()} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl text-slate-900 tracking-tight">Coop<span className="text-emerald-600">Serve</span></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                    Co-op
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium hidden sm:inline -mt-0.5">
                  Fair Cooperative Gig Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Center Cooperative Live Tag */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-600">
              Active Cooperative Pros: <strong className="text-emerald-700">128 Certified</strong>
            </span>
            <span className="text-slate-300">|</span>
            <Link to="/cooperative" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              {t('nav_cooperative')} <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Right User Actions & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Elderly EZ Mode Accessibility Toggle */}
            <button
              onClick={toggleAccessibilityMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isElderlyMode
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title={isElderlyMode ? "Disable Elderly EZ Mode" : "Enable Elderly EZ Mode (Larger fonts & buttons)"}
            >
              <Glasses className={`w-3.5 h-3.5 ${isElderlyMode ? 'text-amber-700' : 'text-emerald-600'}`} />
              <span className="hidden sm:inline">{isElderlyMode ? 'EZ Mode ON' : 'EZ Mode'}</span>
            </button>

            {/* Language Switcher Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left font-medium transition-colors ${
                        language === lang.code ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notification Bell */}
                <button
                  onClick={() => {
                    if (user.role === 'ADMIN') navigate('/admin/notifications');
                    else if (user.role === 'SERVICE_PROVIDER') navigate('/provider/notifications');
                    else navigate('/customer/notifications');
                  }}
                  className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  title={t('nav_notifications')}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white" />
                </button>

                {/* Profile Trigger */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowLangMenu(false);
                    }}
                    className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Avatar
                      src={user.avatar}
                      name={user.name}
                      size="sm"
                      isVerified={user.isVerified || user.role === 'ADMIN'}
                    />
                    <div className="text-left hidden sm:block">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</p>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                      <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{user.location || 'Pune, MH'}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          {t('nav_dashboard')}
                        </Link>
                        {user.role === 'CUSTOMER' && (
                          <Link
                            to="/customer/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-emerald-600" />
                            {t('nav_profile')}
                          </Link>
                        )}
                        <Link
                          to="/cooperative"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          {t('nav_cooperative')}
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav_logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl shadow-sm transition-all"
                >
                  Join Cooperative
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
