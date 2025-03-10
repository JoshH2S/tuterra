
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivacyPolicyProvider } from "./hooks/usePrivacyPolicy";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivacyPolicyProvider>
        <Router>
          <AppRoutes />
          <Toaster />
          <SonnerToaster position="top-center" />
        </Router>
      </PrivacyPolicyProvider>
    </QueryClientProvider>
  );
}

export default App;
