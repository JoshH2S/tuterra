
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNetworkStatus } from '@/hooks/interview/useNetworkStatus';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ConnectionStatusBanner = () => {
  const { isOnline, hasConnectionError, checkConnection, isOfflineMode } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissedTimestamp, setDismissedTimestamp] = useState<number | null>(null);
  
  // Check if we've already dismissed this recently (within 5 minutes)
  const hasRecentlyDismissed = () => {
    if (!dismissedTimestamp) return false;
    const fiveMinutesMs = 5 * 60 * 1000;
    return Date.now() - dismissedTimestamp < fiveMinutesMs;
  };
  
  useEffect(() => {
    // Only show the banner if we're offline or have connection errors
    // and we haven't recently dismissed it
    const shouldShow = (isOfflineMode || !isOnline || hasConnectionError) && !hasRecentlyDismissed();
    
    // Add a small delay to prevent flickering during initial loading
    const timer = setTimeout(() => {
      setShowBanner(shouldShow);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isOnline, hasConnectionError, isOfflineMode]);
  
  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Perform connection check
    await checkConnection();
    
    // Reset retry state after a slight delay for UI feedback
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };
  
  const handleDismiss = () => {
    setShowBanner(false);
    setDismissedTimestamp(Date.now());
    
    // Store dismissed timestamp in session storage
    try {
      sessionStorage.setItem('connectionBannerDismissed', Date.now().toString());
    } catch (e) {
      console.error('Failed to store banner dismissed state:', e);
    }
  };
  
  // If no connection issues or recently dismissed, don't render anything
  if (!showBanner) return null;
  
  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-50 w-full px-4 py-2 touch-manipulation"
        >
          <Alert variant="destructive" className="flex items-center justify-between px-4 py-2 shadow-md">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <div>
                <AlertTitle className="text-sm font-medium">Connection Issue</AlertTitle>
                <AlertDescription className="text-xs">
                  You're currently in offline mode. Some features may be limited.
                </AlertDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 text-xs bg-white/10"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Retry
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-2 text-xs"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
