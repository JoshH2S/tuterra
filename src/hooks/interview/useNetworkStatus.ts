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
      // Use Supabase health check endpoint
      const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obHNydHVieXZnZ3RreXJoa3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MzM4OTUsImV4cCI6MjA1NDIwOTg5NX0.rD-VfZhrrSRpo1rfuO1JoKYkNELxUUGdulu4-sI-kdU',
        },
        // Set a shorter timeout to avoid long waits
        signal: AbortSignal.timeout(5000),
      });

      // Check if response is successful
      const connectionIsHealthy = response.ok;
      
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
