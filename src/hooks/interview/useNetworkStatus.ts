
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [hasConnectionError, setHasConnectionError] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [lastHealthCheckTime, setLastHealthCheckTime] = useState<number>(0);
  const [healthCheckInProgress, setHealthCheckInProgress] = useState<boolean>(false);

  // Function to perform connection health check against Supabase
  const checkConnection = useCallback(async (): Promise<boolean> => {
    // Prevent multiple simultaneous checks
    if (healthCheckInProgress) {
      return isOnline && !hasConnectionError;
    }

    // Rate limit health checks
    const now = Date.now();
    if (now - lastHealthCheckTime < 10000) { // 10 seconds minimum between checks
      return isOnline && !hasConnectionError;
    }

    setHealthCheckInProgress(true);
    setLastHealthCheckTime(now);

    try {
      // Use Supabase health check by making a simple query
      const { error } = await supabase
        .from('interview_sessions')
        .select('count')
        .limit(1)
        .single();
      
      // Check if there's an auth error, which indicates API key issues
      const connectionIsHealthy = !error || (error.code !== 'PGRST301' && error.code !== '401');
      
      if (error && (error.code === 'PGRST301' || error.code === '401')) {
        console.error("API key or authentication error detected:", error);
      }
      
      setHasConnectionError(!connectionIsHealthy);
      setIsOfflineMode(!navigator.onLine || !connectionIsHealthy);
      
      // Store connection state in sessionStorage for cross-tab awareness
      try {
        sessionStorage.setItem('connection_status', JSON.stringify({
          isOnline: navigator.onLine,
          hasConnectionError: !connectionIsHealthy,
          isOfflineMode: !navigator.onLine || !connectionIsHealthy,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error saving connection state to sessionStorage:', e);
      }
      
      return connectionIsHealthy;
    } catch (error) {
      console.warn('Connection health check failed:', error);
      setHasConnectionError(true);
      setIsOfflineMode(true);
      
      // Store connection state in sessionStorage
      try {
        sessionStorage.setItem('connection_status', JSON.stringify({
          isOnline: navigator.onLine,
          hasConnectionError: true,
          isOfflineMode: true,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error saving connection state to sessionStorage:', e);
      }
      
      return false;
    } finally {
      setHealthCheckInProgress(false);
    }
  }, [isOnline, hasConnectionError, healthCheckInProgress, lastHealthCheckTime]);

  // Monitor browser's online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Browser reports online status');
      setIsOnline(true);
      // We'll still keep hasConnectionError until verified otherwise
      // Run a health check to verify actual connectivity
      setTimeout(() => checkConnection(), 1000);
    };

    const handleOffline = () => {
      console.log('Browser reports offline status');
      setIsOnline(false);
      setIsOfflineMode(true);
    };

    // Check connection initially with a small delay
    setTimeout(() => checkConnection(), 1000);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic health check every minute when the tab is active
    let intervalId: number | null = null;
    
    const setupInterval = () => {
      intervalId = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          checkConnection();
        }
      }, 60000); // Check every minute
    };
    
    setupInterval();
    
    // Update interval when visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Run a check immediately when tab becomes visible
        checkConnection();
        // Clear and restart interval
        if (intervalId !== null) {
          clearInterval(intervalId);
        }
        setupInterval();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [checkConnection]);

  return { 
    isOnline, 
    hasConnectionError, 
    isOfflineMode: !isOnline || hasConnectionError,
    checkConnection,
    setIsOfflineMode
  };
};
