
import { useState, useEffect, useCallback } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  hasConnectionError: boolean;
  isOfflineMode: boolean;
  checkConnection: () => Promise<boolean>;
}

/**
 * Hook to check for network connectivity and API connectivity issues
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasConnectionError, setHasConnectionError] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);

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

  // Method to check connection to API/backend
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!isOnline) return false;
    
    setIsCheckingConnection(true);
    
    try {
      // Simple ping to check if we can reach the server
      // Use a cache-busting query param to prevent cached responses
      const response = await fetch(`/api/health-check?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'pragma': 'no-cache' }
      });
      
      const isConnected = response.ok;
      setHasConnectionError(!isConnected);
      
      return isConnected;
    } catch (error) {
      console.error('Connection check failed:', error);
      setHasConnectionError(true);
      return false;
    } finally {
      setIsCheckingConnection(false);
    }
  }, [isOnline]);

  // Determine if we're in offline mode based on online status and connection errors
  const isOfflineMode = !isOnline || hasConnectionError;

  return {
    isOnline,
    hasConnectionError,
    isOfflineMode,
    checkConnection
  };
};
