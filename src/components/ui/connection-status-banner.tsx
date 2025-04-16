import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNetworkStatus } from '@/hooks/interview/useNetworkStatus';
import { WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserCredits } from '@/hooks/useUserCredits';

export const ConnectionStatusBanner = () => {
  const { isOnline, hasConnectionError, checkConnection, isOfflineMode } = useNetworkStatus();
  const { fetchUserCredits, pendingTransactions } = useUserCredits();
  const [showBanner, setShowBanner] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dismissedTimestamp, setDismissedTimestamp] = useState<number | null>(null);
  
  const hasRecentlyDismissed = () => {
    if (!dismissedTimestamp) return false;
    const fiveMinutesMs = 5 * 60 * 1000;
    return Date.now() - dismissedTimestamp < fiveMinutesMs;
  };
  
  useEffect(() => {
    try {
      const storedDismissed = sessionStorage.getItem('connectionBannerDismissed');
      if (storedDismissed) {
        setDismissedTimestamp(parseInt(storedDismissed, 10));
      }
    } catch (e) {
      console.error('Failed to load banner dismissed state:', e);
    }
    
    const shouldShow = (isOfflineMode || !isOnline || hasConnectionError) && !hasRecentlyDismissed();
    
    const timer = setTimeout(() => {
      setShowBanner(shouldShow);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isOnline, hasConnectionError, isOfflineMode]);
  
  const handleRetry = async () => {
    setIsRetrying(true);
    
    const connectionSuccessful = await checkConnection();
    
    if (connectionSuccessful) {
      try {
        await fetchUserCredits();
      } catch (e) {
        console.error('Error fetching credits after connection restored:', e);
      }
    }
    
    setTimeout(() => {
      setIsRetrying(false);
    }, 1000);
  };
  
  const handleDismiss = () => {
    setShowBanner(false);
    setDismissedTimestamp(Date.now());
    
    try {
      sessionStorage.setItem('connectionBannerDismissed', Date.now().toString());
    } catch (e) {
      console.error('Failed to store banner dismissed state:', e);
    }
  };
  
  if (!showBanner) return null;
  
  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-50 w-full px-2 sm:px-4 py-1 touch-manipulation"
        >
          <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 shadow-md">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <WifiOff className="h-4 w-4 flex-shrink-0" />
              <div>
                <AlertTitle className="text-sm font-medium">Connection Issue</AlertTitle>
                <AlertDescription className="text-xs">
                  {pendingTransactions > 0 
                    ? `You're in offline mode with ${pendingTransactions} pending ${pendingTransactions === 1 ? 'change' : 'changes'}.`
                    : "You're currently in offline mode. Some features may be limited."}
                </AlertDescription>
              </div>
            </div>
            <div className="flex gap-2 ml-6 sm:ml-0">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 text-xs bg-white/10 flex-1 sm:flex-auto active:scale-95 transition-transform"
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
                className="h-8 px-2 text-xs flex-1 sm:flex-auto active:scale-95 transition-transform"
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
