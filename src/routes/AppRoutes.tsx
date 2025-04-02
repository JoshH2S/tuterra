
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { authRoutes } from "./AuthRoutes";
import { DashboardRoutes } from "./DashboardRoutes";
import { QuizRoutes } from "./QuizRoutes";
import { CourseRoutes } from "./CourseRoutes";
import { AssessmentRoutes } from "./AssessmentRoutes";
import { MediaRoutes } from "./MediaRoutes";
import { DemoRoutes } from "./DemoRoutes";
import Index from "@/pages/Index";
import JobInterviewSimulator from "@/pages/JobInterviewSimulator";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/components/legal/PrivacyPolicy";
import TermsOfUse from "@/components/legal/TermsOfUse";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdatePassword from "@/pages/UpdatePassword";
import PricingPage from "@/pages/PricingPage";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Auth Routes */}
      {authRoutes}
      
      {/* Protected Routes */}
      <Route path="/dashboard/*" element={<ProtectedRoute><DashboardRoutes /></ProtectedRoute>} />
      <Route path="/quizzes/*" element={<ProtectedRoute><QuizRoutes /></ProtectedRoute>} />
      <Route path="/courses/*" element={<ProtectedRoute><CourseRoutes /></ProtectedRoute>} />
      <Route path="/assessments/*" element={<ProtectedRoute><AssessmentRoutes /></ProtectedRoute>} />
      <Route path="/media/*" element={<ProtectedRoute><MediaRoutes /></ProtectedRoute>} />
      <Route path="/interview-simulator" element={<ProtectedRoute><JobInterviewSimulator /></ProtectedRoute>} />
      <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
      <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
      <Route path="/subscription-success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
      
      {/* Unprotected Routes */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/demos/*" element={<DemoRoutes />} />
      
      {/* Fallback routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
