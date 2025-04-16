
import { useState, useEffect } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  hasConnectionError: boolean;
}

/**
 * Hook to check for network connectivity and API connectivity issues
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasConnectionError, setHasConnectionError] = useState<boolean>(false);

  useEffect(() => {
    // Update online status when it changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Method to track API connection errors
  const trackConnectionError = (hasError: boolean) => {
    setHasConnectionError(hasError);
  };

  return {
    isOnline,
    hasConnectionError,
    trackConnectionError
  };
};
