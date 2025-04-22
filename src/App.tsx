
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { lazyLoad } from "@/utils/lazy-loading";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionStatusBanner } from "@/components/ui/connection-status-banner";
import { supabase } from "@/integrations/supabase/client";

// Lazy load MainLayout
const MainLayout = lazyLoad(
  () => import("@/components/layout/MainLayout").then(
    module => ({ default: module.MainLayout })
  ),
  "MainLayout"
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Improves performance by preventing refetches on window focus
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2, // Retry failed requests twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      meta: {
        // Use meta instead of onError for error handling
        errorHandler: (error: Error) => {
          console.error('Query error:', error);
        }
      }
    },
  },
});

// Loading fallback component
const AppLoading = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  // Add initialization logging
  useEffect(() => {
    console.log('App initialization started');
    
    // Check localStorage availability
    try {
      console.log('localStorage check:', {
        available: !!window.localStorage,
        writable: (() => {
          try {
            window.localStorage.setItem('test', 'test');
            window.localStorage.removeItem('test');
            return true;
          } catch (e) {
            console.error('localStorage write error:', e);
            return false;
          }
        })()
      });
    } catch (e) {
      console.error('localStorage access error:', e);
    }
    
    // Listen for auth events at application level
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('App-level auth event:', event, 'Session exists:', !!session);
    });
    
    return () => {
      subscription.unsubscribe();
      console.log('App cleanup - unsubscribed from auth events');
    };
  }, []);

  return (
    <>
      <ConnectionStatusBanner />
      <Suspense fallback={<AppLoading />}>
        <MainLayout />
      </Suspense>
      <Toaster />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
