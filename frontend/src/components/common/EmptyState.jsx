import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  const { t } = useLanguage();
  const resolvedTitle = title || t('common_no_items');
  const resolvedDescription = description || t('common_no_active_records');
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl ${className}`}>
      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 tracking-tight">{resolvedTitle}</h4>
      <p className="text-sm text-slate-500 mt-1 max-w-md leading-relaxed">{resolvedDescription}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
