
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import OnboardingPage from "@/pages/OnboardingPage";
import { authRoutes } from "./AuthRoutes";
import { dashboardRoutes } from "./DashboardRoutes";
import { quizRoutes } from "./QuizRoutes";
import { courseRoutes } from "./CourseRoutes";
import { assessmentRoutes } from "./AssessmentRoutes";
import { mediaRoutes } from "./MediaRoutes";
import { demoRoutes } from "./DemoRoutes";
import Index from "@/pages/Index";
import JobInterviewSimulator from "@/pages/JobInterviewSimulator";
import NotFound from "@/pages/NotFound";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfUse } from "@/components/legal/TermsOfUse";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdatePassword from "@/pages/UpdatePassword";
import PricingPage from "@/pages/PricingPage";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCanceled from "@/pages/SubscriptionCanceled";
import Contact from "@/pages/Contact";
import OnboardingRedirect from "@/pages/OnboardingRedirect";
import StripeCheckoutRedirect from "@/components/checkout/StripeCheckoutRedirect";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Auth Routes */}
      {authRoutes}
      
      {/* Public Routes */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Routes>
            {dashboardRoutes}
          </Routes>
        </ProtectedRoute>
      } />
      
      <Route path="/quizzes/*" element={
        <ProtectedRoute>
          <Routes>
            {quizRoutes}
          </Routes>
        </ProtectedRoute>
      } />
      
      <Route path="/courses/*" element={
        <ProtectedRoute>
          <Routes>
            {courseRoutes}
          </Routes>
        </ProtectedRoute>
      } />
      
      <Route path="/assessments/*" element={
        <ProtectedRoute>
          <Routes>
            {assessmentRoutes}
          </Routes>
        </ProtectedRoute>
      } />
      
      <Route path="/media/*" element={
        <ProtectedRoute>
          <Routes>
            {mediaRoutes}
          </Routes>
        </ProtectedRoute>
      } />
      
      {/* Interview simulator routes */}
      <Route path="/interview-simulator" element={
        <ProtectedRoute>
          <JobInterviewSimulator />
        </ProtectedRoute>
      } />
      
      {/* Interview session route with ID parameter */}
      <Route path="/interview/:id" element={
        <ProtectedRoute>
          <JobInterviewSimulator />
        </ProtectedRoute>
      } />
      
      <Route path="/profile-settings" element={
        <ProtectedRoute>
          <ProfileSettings />
        </ProtectedRoute>
      } />
      
      <Route path="/update-password" element={
        <ProtectedRoute>
          <UpdatePassword />
        </ProtectedRoute>
      } />
      
      <Route path="/subscription-success" element={
        <ProtectedRoute>
          <SubscriptionSuccess />
        </ProtectedRoute>
      } />
      
      <Route path="/subscription-canceled" element={
        <ProtectedRoute>
          <SubscriptionCanceled />
        </ProtectedRoute>
      } />
      
      {/* Unprotected Routes */}
      
      <Route path="/demos/*" element={
        <Routes>
          {demoRoutes}
        </Routes>
      } />
      
      {/* Onboarding and checkout routes */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingPage />
        </ProtectedRoute>
      } />
      
      <Route path="/onboarding-redirect" element={
        <ProtectedRoute>
          <OnboardingRedirect />
        </ProtectedRoute>
      } />
      
      <Route path="/checkout/stripe" element={
        <ProtectedRoute>
          <StripeCheckoutRedirect />
        </ProtectedRoute>
      } />
      
      {/* Fallback routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
