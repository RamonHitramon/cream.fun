import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  userAddress: string;
  enabled: boolean;
  interval?: number;
}

export function useAutoRefresh({ 
  userAddress, 
  enabled, 
  interval = 15000 
}: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !userAddress) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial refresh
    const refreshData = async () => {
      try {
        // TODO: Implement actual data refresh logic
        // This could trigger portfolio updates, position updates, etc.
        console.log('Auto-refreshing data for:', userAddress);
        
        // Dispatch custom events for components to listen to
        window.dispatchEvent(new CustomEvent('autoRefresh', {
          detail: { userAddress, timestamp: Date.now() }
        }));
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    };

    // Set up interval
    intervalRef.current = setInterval(refreshData, interval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userAddress, enabled, interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
