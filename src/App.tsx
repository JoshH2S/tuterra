
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { lazyLoad } from "@/utils/lazy-loading";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionStatusBanner } from "@/components/ui/connection-status-banner";
import { supabase } from "@/integrations/supabase/client";

// Record diagnostic event
if (window.__tuterra_diagnostics) {
  window.__tuterra_diagnostics.recordEvent('App.tsx execution started');
}

// Lazy load MainLayout
const MainLayout = lazyLoad(
  () => {
    if (window.__tuterra_diagnostics) {
      window.__tuterra_diagnostics.recordEvent('MainLayout import started');
    }
    
    return import("@/components/layout/MainLayout").then(
      module => {
        if (window.__tuterra_diagnostics) {
          window.__tuterra_diagnostics.recordEvent('MainLayout import completed');
        }
        return { default: module.MainLayout };
      }
    );
  },
  "MainLayout"
);

// Create query client with detailed error logging
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
          console.error('[TUTERRA DIAGNOSTICS] Query error:', error);
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
  // Add comprehensive initialization logging
  useEffect(() => {
    console.log('[TUTERRA DIAGNOSTICS] App initialization started');
    
    if (window.__tuterra_diagnostics) {
      window.__tuterra_diagnostics.recordEvent('AppContent mounted');
    }
    
    // Check localStorage availability with detailed error reporting
    try {
      const storageStatus = {
        available: !!window.localStorage,
        writable: (() => {
          try {
            window.localStorage.setItem('app_init_test', 'test');
            const readValue = window.localStorage.getItem('app_init_test');
            window.localStorage.removeItem('app_init_test');
            return {
              canWrite: true,
              canRead: readValue === 'test',
              value: readValue
            };
          } catch (e) {
            console.error('[TUTERRA DIAGNOSTICS] localStorage write/read error:', e);
            return {
              canWrite: false,
              error: e.message
            };
          }
        })(),
        storageType: window.localStorage ? window.localStorage.constructor.name : 'undefined',
        storageSize: (() => {
          try {
            let size = 0;
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i) || '';
              const value = localStorage.getItem(key) || '';
              size += key.length + value.length;
            }
            return `${(size / 1024).toFixed(2)} KB`;
          } catch (e) {
            return `Error: ${e.message}`;
          }
        })()
      };
      
      console.log('[TUTERRA DIAGNOSTICS] localStorage check:', storageStatus);
    } catch (e) {
      console.error('[TUTERRA DIAGNOSTICS] localStorage access error:', e);
    }
    
    // Test sessionStorage too
    try {
      sessionStorage.setItem('session_test', 'test');
      sessionStorage.removeItem('session_test');
      console.log('[TUTERRA DIAGNOSTICS] sessionStorage available and working');
    } catch (e) {
      console.error('[TUTERRA DIAGNOSTICS] sessionStorage error:', e);
    }
    
    // Check for IndexedDB access
    try {
      const request = indexedDB.open('tuterra_diagnostic_test', 1);
      request.onerror = (event) => {
        console.error('[TUTERRA DIAGNOSTICS] IndexedDB access error:', event);
      };
      request.onsuccess = (event) => {
        console.log('[TUTERRA DIAGNOSTICS] IndexedDB available and working');
        const db = request.result;
        db.close();
        // Optional: delete the test database
        indexedDB.deleteDatabase('tuterra_diagnostic_test');
      };
    } catch (e) {
      console.error('[TUTERRA DIAGNOSTICS] IndexedDB error:', e);
    }
    
    // Listen for auth events at application level with detailed logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[TUTERRA DIAGNOSTICS] App-level auth event:', event, 'Session exists:', !!session, 
        'Session ID:', session?.id?.substring(0, 8), 
        'User ID:', session?.user?.id?.substring(0, 8));
      
      if (window.__tuterra_diagnostics) {
        window.__tuterra_diagnostics.recordEvent(`Auth event: ${event}`);
      }
    });
    
    // Perform early auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[TUTERRA DIAGNOSTICS] Early session check:', !!session,
        'Session ID:', session?.id?.substring(0, 8),
        'User ID:', session?.user?.id?.substring(0, 8));
    }).catch(error => {
      console.error('[TUTERRA DIAGNOSTICS] Early session check error:', error);
    });
    
    return () => {
      subscription.unsubscribe();
      console.log('[TUTERRA DIAGNOSTICS] App cleanup - unsubscribed from auth events');
      
      if (window.__tuterra_diagnostics) {
        window.__tuterra_diagnostics.recordEvent('AppContent unmounted');
      }
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
  useEffect(() => {
    if (window.__tuterra_diagnostics) {
      window.__tuterra_diagnostics.recordEvent('App component mounted');
    }
    
    // Final diagnostic dump after app is mounted
    setTimeout(() => {
      if (window.__tuterra_diagnostics) {
        console.log('[TUTERRA DIAGNOSTICS] Full app initialization timeline:', 
          window.__tuterra_diagnostics.pageLoadEvents);
        
        console.log('[TUTERRA DIAGNOSTICS] App initialization complete. Total time:', 
          Date.now() - window.__tuterra_diagnostics.loadTimestamp, 'ms');
      }
    }, 2000);
    
    return () => {
      if (window.__tuterra_diagnostics) {
        window.__tuterra_diagnostics.recordEvent('App component unmounting');
      }
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
