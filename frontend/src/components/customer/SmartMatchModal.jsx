import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { SmartMatchCard } from './SmartMatchCard';
import { BookingFlowModal } from './BookingFlowModal';
import { LoadingState } from '../common/LoadingState';
import {
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Users
} from 'lucide-react';

export const SmartMatchModal = ({
  isOpen,
  onClose,
  category,
  serviceTitle,
  initialServiceId,
  initialService
}) => {
  const navigate = useNavigate();
  const [isMatching, setIsMatching] = useState(true);
  const [matchResult, setMatchResult] = useState(null);
  const [selectedAlternative, setSelectedAlternative] = useState(null);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState(null);
  const [bookingFlowOpen, setBookingFlowOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const executeSmartMatch = async () => {
        setIsMatching(true);
        try {
          // Reuse the existing matching engine via api.smartMatch()
          const res = await api.smartMatch({
            category: category?.id || category,
            serviceTitle: serviceTitle || category?.name,
            urgency: 'today'
          });

          if (res.success) {
            setMatchResult(res);
            setSelectedAlternative(null);
          }
        } catch (err) {
          console.error('Error running smart matching:', err);
        } finally {
          setIsMatching(false);
        }
      };

      executeSmartMatch();
    }
  }, [isOpen, category, serviceTitle]);

  useEffect(() => {
    if (!isOpen) {
      setBookingFlowOpen(false);
      setSelectedProviderForBooking(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const topMatch = selectedAlternative || matchResult?.topMatch;
  const alternatives = matchResult?.rankedProviders?.filter(p => p.id !== topMatch?.id) || [];

  const handleInstantMatchBooking = (prov) => {
    if (!prov) {
      return;
    }

    setSelectedProviderForBooking(prov);
    setBookingFlowOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Instant Match"
        description={`CoopServe automatically selects the best available matched provider for ${serviceTitle || category?.name || 'your service'}`}
        maxWidth="max-w-4xl"
      >
        {isMatching ? (
          <div className="py-12 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              <Sparkles className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                Finding your instant-match provider...
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                CoopServe is ranking the best available provider based on proximity, skill fit, availability, and trust score.
              </p>
            </div>
          </div>
        ) : matchResult && topMatch ? (
          <div className="space-y-6">
            {/* Top Matched Spotlight */}
            <SmartMatchCard
              matchResult={topMatch}
              onBook={(prov) => {
                handleInstantMatchBooking(prov);
              }}
            />

            {/* Alternative Ranked Providers List */}
            {alternatives.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Other Suitable Verified Providers:
                  </h4>
                  <span className="text-[11px] text-slate-400">Ranked by AI match algorithm</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => setSelectedAlternative(alt)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={alt.avatar} name={alt.name} size="md" isVerified={alt.isVerified} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900">{alt.name}</p>
                            <Badge variant="coop" size="sm">{alt.matchScore}% Match</Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{alt.skill} • {alt.distanceKm} km</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-emerald-700">₹{alt.startingPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-slate-700">No provider is available for Instant Match right now.</p>
            <p className="text-xs text-slate-500 mt-2">Try browsing providers manually or choose a different service window.</p>
          </div>
        )}
      </Modal>

      {selectedProviderForBooking && (
        <BookingFlowModal
          isOpen={bookingFlowOpen}
          onClose={() => {
            setBookingFlowOpen(false);
            setSelectedProviderForBooking(null);
          }}
          provider={selectedProviderForBooking}
          initialService={
            initialService || {
              item: serviceTitle || selectedProviderForBooking?.skill || 'Service',
              title: serviceTitle || selectedProviderForBooking?.skill || 'Service',
              price: selectedProviderForBooking?.startingPrice || 400
            }
          }
          initialPrice={initialService?.basePrice ?? selectedProviderForBooking?.startingPrice ?? 400}
        />
      )}
    </>
  );
};
