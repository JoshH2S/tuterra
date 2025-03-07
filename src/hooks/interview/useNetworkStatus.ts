
import { useState, useEffect } from "react";

/**
 * Hook for tracking online/offline status
 * Enhanced for mobile-first design with better touch interface support
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      console.log("Network connection restored");
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log("Network connection lost");
      setIsOnline(false);
    };
    
    // Handle network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // On mobile devices, use the Page Visibility API to check connection when app returns to foreground
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Update online status when page becomes visible again
        setIsOnline(navigator.onLine);
      }
    });
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', () => {});
    };
  }, []);
  
  return { isOnline };
};
