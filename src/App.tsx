
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionStatusBanner } from "@/components/ui/connection-status-banner";

// Record diagnostic event
if (window.__tuterra_diagnostics) {
  window.__tuterra_diagnostics.recordEvent('App.tsx execution started');
}

// Create query client with detailed error logging
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      meta: {
        errorHandler: (error: Error) => {
          console.error('[TUTERRA DIAGNOSTICS] Query error:', error);
        }
      }
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConnectionStatusBanner />
        <MainLayout />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
