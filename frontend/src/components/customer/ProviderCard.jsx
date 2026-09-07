import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';
import {
  Star,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Sparkles
} from 'lucide-react';

export const ProviderCard = ({ provider, onBook }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!provider) return null;

  return (
    <Card hoverable className="flex flex-col justify-between p-5 border border-slate-200/90 group transition-all duration-200">
      <div>
        {/* Top Header: Avatar, Name, Skill, Trust Score Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={provider.avatar}
              name={provider.name}
              size="lg"
              isVerified={provider.isVerified}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {provider.name}
                </h4>
              </div>
              <p className="text-xs font-semibold text-emerald-800 line-clamp-1">{provider.skill}</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{provider.location}</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">{provider.distanceKm} {t('card_km_away')}</span>
              </p>
            </div>
          </div>

          {/* Trust Score Pill */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200/80 px-2 py-1 rounded-xl shadow-xs">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-black text-indigo-900">{provider.trustScore}</span>
              <span className="text-[10px] text-indigo-500 font-bold">/100</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
              {t('card_trust_score')}
            </span>
          </div>
        </div>

        {/* Mid Row: Rating, Completed Jobs, Availability */}
        <div className="grid grid-cols-3 gap-2 my-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{provider.rating}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">({provider.reviewsCount ?? 0} {t('common_reviews')})</p>
          </div>

          <div className="border-x border-slate-200/60">
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{provider.jobsCompleted}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{t('card_completed_jobs')}</p>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span className="truncate">{provider.availabilityStatus || t('card_available')}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{provider.experienceYears}+ {t('card_years_experience')}</p>
          </div>
        </div>

        {/* Short Bio Snippet */}
        {provider.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {provider.bio}
          </p>
        )}
      </div>

      {/* Bottom Footer: Price + Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">{t('card_starting_from')}</span>
          <span className="text-base font-black text-slate-900">₹{provider.startingPrice}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/customer/provider/${provider.id}`)}
          >
            {t('card_view_profile')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (onBook) onBook(provider);
              else navigate(`/customer/provider/${provider.id}`);
            }}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {t('card_book_now')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
