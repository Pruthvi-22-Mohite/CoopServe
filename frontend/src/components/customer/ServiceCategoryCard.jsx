import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles,
  Wrench,
  Zap,
  Trees,
  Hammer,
  Paintbrush,
  Tv,
  Home,
  ArrowRight
} from 'lucide-react';

const iconMap = {
  Sparkles,
  Wrench,
  Zap,
  Trees,
  Hammer,
  Paintbrush,
  Tv,
  Home
};

export const ServiceCategoryCard = ({ category, isSelected = false, onClick }) => {
  const { language } = useLanguage();
  const IconComponent = iconMap[category.icon] || Sparkles;

  const getCategoryTitle = () => {
    if (language === 'hi' && category.nameHi) return category.nameHi;
    if (language === 'mr' && category.nameMr) return category.nameMr;
    return category.name;
  };

  return (
    <Card
      hoverable
      onClick={onClick}
      className={`p-4 group transition-all duration-200 ${
        isSelected
          ? 'border-2 border-emerald-600 bg-emerald-50/50 shadow-md scale-[1.02]'
          : 'hover:border-emerald-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`p-3 rounded-2xl transition-colors ${
            isSelected
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'
          }`}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        {category.popular && (
          <Badge variant="coop" size="sm">
            Popular
          </Badge>
        )}
      </div>

      <h4
        className={`font-bold text-sm transition-colors ${
          isSelected ? 'text-emerald-900' : 'text-slate-800 group-hover:text-emerald-700'
        }`}
      >
        {getCategoryTitle()}
      </h4>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-500">{category.count} Verified Pros</span>
        <span className="font-bold text-slate-900">From ₹{category.avgPrice}</span>
      </div>
    </Card>
  );
};
