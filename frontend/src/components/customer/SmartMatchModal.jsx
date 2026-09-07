import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { SmartMatchCard } from './SmartMatchCard';
import { BookingFlowModal } from './BookingFlowModal';
import {
  Sparkles,
  Users,
  Clock3,
  AlertTriangle
} from 'lucide-react';

const EMERGENCY_TIMEOUT_MS = 120000;
const EMERGENCY_EXPANDED_RADIUS_KM = 15;

export const SmartMatchModal = ({
  isOpen,
  onClose,
  category,
  serviceTitle,
  initialServiceId,
  initialService,
  emergencyMode = false
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isMatching, setIsMatching] = useState(true);
  const [matchResult, setMatchResult] = useState(null);
  const [selectedAlternative, setSelectedAlternative] = useState(null);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState(null);
  const [bookingFlowOpen, setBookingFlowOpen] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState('Finding an available provider...');
  const [emergencyBooking, setEmergencyBooking] = useState(null);
  const [emergencyExpanded, setEmergencyExpanded] = useState(false);
  const [emergencyRetryUsed, setEmergencyRetryUsed] = useState(false);

  const emergencyTimerRef = useRef(null);
  const emergencyPollRef = useRef(null);
  const emergencyRetryUsedRef = useRef(false);

  const clearEmergencyMonitoring = () => {
    if (emergencyTimerRef.current) {
      clearTimeout(emergencyTimerRef.current);
      emergencyTimerRef.current = null;
    }
    if (emergencyPollRef.current) {
      clearInterval(emergencyPollRef.current);
      emergencyPollRef.current = null;
    }
  };

  const stopEmergencyMonitoring = () => {
    clearEmergencyMonitoring();
    setEmergencyExpanded(false);
  };

  const handleEmergencyBookingCreated = async (booking) => {
    if (!booking) return;

    setEmergencyBooking(booking);
    setEmergencyStatus('Waiting for provider response...');
    setEmergencyExpanded(false);
    setEmergencyRetryUsed(false);
    emergencyRetryUsedRef.current = false;
    clearEmergencyMonitoring();

    const checkBookingStatus = async () => {
      try {
        const res = await api.getBookingById(booking.id);
        const liveBooking = res?.booking;

        if (!liveBooking) {
          return;
        }

        if (liveBooking.status === 'PROVIDER_ACCEPTED') {
          stopEmergencyMonitoring();
          setEmergencyStatus('Provider accepted. Continuing the existing booking flow.');
          return;
        }

        if (['CANCELLED', 'REJECTED', 'COMPLETED'].includes(liveBooking.status)) {
          stopEmergencyMonitoring();
          setEmergencyStatus('Emergency booking is no longer active.');
          return;
        }
      } catch (err) {
        console.warn('Emergency status poll failed:', err.message);
      }
    };

    emergencyPollRef.current = setInterval(checkBookingStatus, 15000);

    emergencyTimerRef.current = setTimeout(async () => {
      try {
        const latestBookingRes = await api.getBookingById(booking.id);
        const latestBooking = latestBookingRes?.booking;

        if (!latestBooking || ['CANCELLED', 'REJECTED', 'COMPLETED'].includes(latestBooking.status)) {
          stopEmergencyMonitoring();
          setEmergencyStatus('Emergency booking is no longer active.');
          return;
        }

        if (latestBooking.status === 'PROVIDER_ACCEPTED') {
          stopEmergencyMonitoring();
          setEmergencyStatus('Provider accepted. Continuing the existing booking flow.');
          return;
        }

        if (latestBooking.status !== 'BOOKED' || emergencyRetryUsedRef.current) {
          stopEmergencyMonitoring();
          setEmergencyStatus('Emergency retry is no longer eligible for this booking.');
          return;
        }

        setEmergencyExpanded(true);
        setEmergencyStatus('Expanding search area...');
        showToast('No provider response within about 2 minutes. Expanding the search area.', 'info');

        const retryRes = await api.smartMatch({
          category: category?.id || category,
          serviceTitle: serviceTitle || category?.name,
          urgency: 'today',
          radiusKm: EMERGENCY_EXPANDED_RADIUS_KM
        });

        const retryProvider = retryRes?.rankedProviders?.find(
          (provider) => provider.id !== latestBooking.providerId
        );

        if (!retryProvider || !retryRes?.success) {
          setEmergencyStatus('No additional provider was found within the expanded search area.');
          showToast('No additional provider was found within the expanded search area.', 'info');
          clearEmergencyMonitoring();
          return;
        }

        const reassignRes = await api.emergencyReassignBooking(booking.id, retryProvider.id);
        if (reassignRes?.success) {
          emergencyRetryUsedRef.current = true;
          setEmergencyRetryUsed(true);
          setEmergencyStatus('Provider reassigned. Your emergency request is continuing.');
          showToast('Provider reassigned. Your emergency request is continuing.', 'success');
          clearEmergencyMonitoring();
          return;
        }

        setEmergencyStatus('No additional provider was found within the expanded search area.');
        showToast(reassignRes?.message || 'No additional provider was found within the expanded search area.', 'info');
        clearEmergencyMonitoring();
      } catch (err) {
        console.error('Emergency retry failed:', err);
        setEmergencyStatus('No additional provider was found within the expanded search area.');
        showToast('No additional provider was found within the expanded search area.', 'info');
        clearEmergencyMonitoring();
      }
    }, EMERGENCY_TIMEOUT_MS);
  };

  useEffect(() => {
    if (!isOpen) {
      clearEmergencyMonitoring();
      setBookingFlowOpen(false);
      setSelectedProviderForBooking(null);
      setEmergencyBooking(null);
      setEmergencyStatus('Finding an available provider...');
      setEmergencyExpanded(false);
      setEmergencyRetryUsed(false);
      emergencyRetryUsedRef.current = false;
      return;
    }

    if (emergencyMode) {
      setEmergencyStatus('Finding an available provider...');
      setEmergencyBooking(null);
      setEmergencyExpanded(false);
      setEmergencyRetryUsed(false);
      emergencyRetryUsedRef.current = false;
      clearEmergencyMonitoring();

      const executeEmergencyMatch = async () => {
        setIsMatching(true);
        try {
          const res = await api.smartMatch({
            category: category?.id || category,
            serviceTitle: serviceTitle || category?.name,
            urgency: 'today'
          });

          if (res.success) {
            setMatchResult(res);
            setSelectedAlternative(null);

            if (res.topMatch) {
              setSelectedProviderForBooking(res.topMatch);
              setBookingFlowOpen(true);
            } else {
              setEmergencyStatus('No provider was available for the initial emergency search.');
            }
          }
        } catch (err) {
          console.error('Emergency match failed:', err);
          setEmergencyStatus('No provider was available for the initial emergency search.');
        } finally {
          setIsMatching(false);
        }
      };

      executeEmergencyMatch();
      return () => clearEmergencyMonitoring();
    }

    const executeSmartMatch = async () => {
      setIsMatching(true);
      try {
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
  }, [isOpen, emergencyMode, category, serviceTitle]);

  if (!isOpen) return null;

  const topMatch = selectedAlternative || matchResult?.topMatch;
  const alternatives = matchResult?.rankedProviders?.filter(p => p.id !== topMatch?.id) || [];

  const handleInstantMatchBooking = (prov) => {
    if (!prov) return;
    setSelectedProviderForBooking(prov);
    setBookingFlowOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={emergencyMode ? 'Emergency Booking' : 'Instant Match'}
        description={
          emergencyMode
            ? 'Emergency booking uses the existing smart match and existing booking flow. If no provider accepts within about 2 minutes, CoopServe will expand the search area once.'
            : `CoopServe automatically selects the best available matched provider for ${serviceTitle || category?.name || 'your service'}`
        }
        maxWidth="max-w-4xl"
      >
        {emergencyMode ? (
          <div className="py-8 text-center space-y-5">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin" />
              <AlertTriangle className="w-6 h-6 text-rose-600 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-slate-800">
                {emergencyExpanded ? 'Expanding search area...' : 'Finding an available provider...'}
              </h4>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                {emergencyStatus || "We're finding the nearest available provider for your emergency request."}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-left space-y-3">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <Clock3 className="w-4 h-4" />
                Emergency status
              </div>
              <p className="text-sm text-slate-700">
                {emergencyBooking
                  ? 'Waiting for provider response... We\'ll expand the search area if no provider responds within about 2 minutes.'
                  : 'Emergency booking is being routed through the normal booking flow and will continue with the same service request.'}
              </p>
            </div>
          </div>
        ) : isMatching ? (
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
            <SmartMatchCard
              matchResult={topMatch}
              onBook={(prov) => {
                handleInstantMatchBooking(prov);
              }}
            />

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
            clearEmergencyMonitoring();
            setBookingFlowOpen(false);
            setSelectedProviderForBooking(null);
            setEmergencyBooking(null);
            setEmergencyStatus('Finding an available provider...');
            onClose();
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
          onBookingCreated={emergencyMode ? handleEmergencyBookingCreated : undefined}
        />
      )}
    </>
  );
};
