
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { lazyLoad } from "@/utils/lazy-loading";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionStatusBanner } from "@/components/ui/connection-status-banner";

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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConnectionStatusBanner />
        <Suspense fallback={<AppLoading />}>
          <MainLayout />
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
