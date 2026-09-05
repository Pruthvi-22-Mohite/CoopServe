import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, Wrench, ChevronRight, Zap } from 'lucide-react';

export const DemoRoleSwitcher = () => {
  const { user, demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSwitch = async (role, destination) => {
    await demoLogin(role, true);
    navigate(destination);
    setIsExpanded(false);
  };

  const activeRole = user?.role || 'CUSTOMER';

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-40">
      {isExpanded ? (
        <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md w-72 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Demo Role Switcher
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            {/* Customer Option */}
            <button
              onClick={() => handleSwitch('CUSTOMER', '/customer/dashboard')}
              disabled={isLoading}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-xs ${
                activeRole === 'CUSTOMER'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-semibold">Customer (Ananya)</p>
                  <p className="text-[10px] text-slate-300 opacity-80">Book & Track Protected Services</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            {/* Provider Option */}
            <button
              onClick={() => handleSwitch('SERVICE_PROVIDER', '/provider/dashboard')}
              disabled={isLoading}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-xs ${
                activeRole === 'SERVICE_PROVIDER'
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="font-semibold">Worker (Rahul)</p>
                  <p className="text-[10px] text-slate-300 opacity-80">Jobs, Net Earnings, Trust Score</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>

            {/* Admin Option */}
            <button
              onClick={() => handleSwitch('ADMIN', '/admin/dashboard')}
              disabled={isLoading}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors text-xs ${
                activeRole === 'ADMIN'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-rose-400" />
                <div>
                  <p className="font-semibold">Cooperative Admin</p>
                  <p className="text-[10px] text-slate-300 opacity-80">AI Matching, Anti-Leakage & KPIs</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl border border-slate-700 hover:scale-105 transition-all text-xs font-semibold"
          title="Switch Demo Role"
        >
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span>Switch Role: <strong>{activeRole}</strong></span>
        </button>
      )}
    </div>
  );
};
