import { useEffect } from 'react';
import { subscribeToBookingUpdates } from '../services/socket';

export const useAdminLiveRefresh = (refresh, intervalMs = 30000) => {
  useEffect(() => {
    if (typeof refresh !== 'function') return undefined;

    refresh();
    const unsubscribe = subscribeToBookingUpdates(refresh, refresh, refresh);
    const timer = window.setInterval(refresh, intervalMs);

    return () => {
      if (unsubscribe) unsubscribe();
      window.clearInterval(timer);
    };
  }, [refresh, intervalMs]);
};
