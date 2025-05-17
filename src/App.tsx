
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./hooks/auth";
import { InternshipProvider } from '@/hooks/internship';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Import the ReactQueryDevtools if you need them later
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SubscriptionProvider } from "./hooks/subscription";
import { ModalProvider } from "./hooks/modal";
import { SocketProvider } from "./hooks/socket";
import { AIProvider } from "./hooks/ai";
import { StudySessionProvider } from "./hooks/study-session";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <SubscriptionProvider>
            <ModalProvider>
              <SocketProvider>
                <AIProvider>
                  <StudySessionProvider>
                    <InternshipProvider>
                      <Router>
                        <AppRoutes />
                        <Toaster />
                      </Router>
                    </InternshipProvider>
                  </StudySessionProvider>
                </AIProvider>
              </SocketProvider>
            </ModalProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
      {/* Comment out ReactQueryDevtools until installed */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;
