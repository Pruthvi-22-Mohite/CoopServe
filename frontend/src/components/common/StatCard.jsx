import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  trend,
  icon: Icon,
  badgeText,
  accentColor,
  variant = 'emerald',
  className = '',
  onClick
}) => {
  // Support variant mapping
  const colorKey = accentColor || (
    variant === 'primary' ? 'emerald' :
    variant === 'success' ? 'emerald' :
    variant === 'info' ? 'blue' :
    variant === 'warning' ? 'amber' :
    variant === 'danger' ? 'rose' :
    variant
  );

  const accentBgs = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    blue: 'bg-sky-50 text-sky-700 border-sky-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  // Resolve trend text
  const trendText = trend?.text || subtitle || change;
  const isUp = trend?.direction ? trend.direction === 'up' : isPositive;

  return (
    <Card
      onClick={onClick}
      hoverable={!!onClick}
      className={`relative overflow-hidden p-5 border border-slate-200/90 shadow-soft bg-white transition-all duration-200 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-2xl border ${accentBgs[colorKey] || accentBgs.emerald} shadow-xs shrink-0`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      {trendText && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100/90">
          <div className="flex items-center gap-1.5 text-slate-500">
            {trend?.direction || change ? (
              <span className={`inline-flex items-center font-bold text-[11px] ${isUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {change}
              </span>
            ) : null}
            <span className="text-[11px] font-medium text-slate-600 truncate">{trendText}</span>
          </div>
          {badgeText && (
            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
