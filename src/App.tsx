
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load MainLayout
const MainLayout = lazy(() => import("@/components/layout/MainLayout").then(
  module => ({ default: module.MainLayout })
));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Improves performance by preventing refetches on window focus
      staleTime: 1000 * 60 * 5, // 5 minutes
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
        <Suspense fallback={<AppLoading />}>
          <MainLayout />
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
