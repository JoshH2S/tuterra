
import { useState, useEffect, useCallback } from "react";

/**
 * Enhanced hook for tracking online/offline status
 * with mobile-first design and better error handling
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  
  // Actively check connection by making a small request
  const checkConnection = useCallback(async () => {
    try {
      // Try to fetch a tiny resource to verify connection (using cache to minimize data usage)
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD', 
        cache: 'force-cache',
        // Small timeout to prevent hanging requests
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        setHasConnectionError(false);
        setIsOnline(true);
      } else {
        setHasConnectionError(true);
      }
    } catch (error) {
      console.log("Connection check failed:", error);
      setHasConnectionError(true);
      // Don't set offline immediately as browser's online status might still be true
    }
  }, []);
  
  useEffect(() => {
    // Initial connection check
    checkConnection();
    
    const handleOnline = () => {
      console.log("Browser reports online status");
      setIsOnline(true);
      // Verify with actual request
      checkConnection();
    };
    
    const handleOffline = () => {
      console.log("Browser reports offline status");
      setIsOnline(false);
      setHasConnectionError(true);
    };
    
    // Handle WebSocket errors globally
    const handleError = (event) => {
      if (event.target instanceof WebSocket) {
        console.log("WebSocket connection error detected");
        setHasConnectionError(true);
      }
    };
    
    // Handle failed resource loads that might indicate connection issues
    const handleResourceError = (event) => {
      // Only consider certain resources critical for connectivity diagnosis
      if (event.target.tagName === 'SCRIPT' || event.target.tagName === 'IMG') {
        console.log("Resource failed to load:", event);
        setHasConnectionError(true);
      }
    };
    
    // Handle network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('error', handleError, true);
    window.addEventListener('error', handleResourceError, true);
    
    // On mobile devices, use the Page Visibility API to check connection when app returns to foreground
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Update online status and check connectivity when page becomes visible again
        setIsOnline(navigator.onLine);
        checkConnection();
      }
    });
    
    // Periodically check connection when online
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkConnection();
      }
    }, 30000); // Every 30 seconds
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('error', handleResourceError, true);
      document.removeEventListener('visibilitychange', () => {});
      clearInterval(intervalId);
    };
  }, [checkConnection]);
  
  return { 
    isOnline, 
    hasConnectionError,
    checkConnection, // Export so components can manually check
    isOfflineMode: !isOnline || hasConnectionError // Simplified status for components
  };
};
