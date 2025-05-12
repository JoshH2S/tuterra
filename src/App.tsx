import { Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CreditsProvider } from "@/context/CreditsContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProtectedRouteProps } from "@/components/auth/ProtectedRoute";
import { Suspense, lazy } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Lazy-loaded pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const SuccessPage = lazy(() => import("@/pages/SuccessPage"));
const QuizGeneratorPage = lazy(() => import("@/pages/QuizGeneratorPage"));
const QuizPage = lazy(() => import("@/pages/QuizPage"));
const QuizResultsPage = lazy(() => import("@/pages/QuizResultsPage"));
const JobInterviewSimulator = lazy(() => import("@/pages/JobInterviewSimulator"));
const InternshipPage = lazy(() => import("@/pages/InternshipPage"));

// Auth redirect component
const AuthRedirect = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  return null;
};

// Default protected route settings
const defaultProtectedRouteProps: Omit<ProtectedRouteProps, "outlet"> = {
  isAuthenticated: false,
  authenticationPath: "/login",
  redirectPath: "/dashboard",
  setRedirectPath: () => {},
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tuterra-theme">
      <AuthProvider>
        <SubscriptionProvider>
          <CreditsProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/success" element={<SuccessPage />} />
                
                {/* Protected routes */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute
                      {...defaultProtectedRouteProps}
                      outlet={<OnboardingPage />}
                    />
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute
                      {...defaultProtectedRouteProps}
                      outlet={<DashboardPage />}
                    />
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute
                      {...defaultProtectedRouteProps}
                      outlet={<AccountPage />}
                    />
                  }
                />
                <Route
                  path="/quiz-generator"
                  element={
                    <ProtectedRoute
                      {...defaultProtectedRouteProps}
                      outlet={<QuizGeneratorPage />}
                    />
                  }
                />
                <Route
                  path="/quiz/:id"
                  element={
                    <ProtectedRoute
                      {...defaultProtectedRouteProps}
                      outlet={<QuizPage />}
                    />
                  }
                />
                <Route
                  path="/quiz/:id/results"
                  element={
                    <ProtectedRoute
                      {...defaultProtectedRouteProps}
                      outlet={<QuizResultsPage />}
                    />
                  }
                />
                <Route path="/interview" element={<JobInterviewSimulator />} />
                <Route path="/interview/:id" element={<JobInterviewSimulator />} />
                <Route path="/internship/:id" element={<InternshipPage />} />
              </Routes>
            </Suspense>
            <Toaster />
          </CreditsProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
