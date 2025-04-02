
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
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

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Auth Routes */}
      {authRoutes}
      
      {/* Protected Routes */}
      <Route path="/dashboard/*" element={<ProtectedRoute><Route path="/*" element={<>{dashboardRoutes}</>} /></ProtectedRoute>} />
      <Route path="/quizzes/*" element={<ProtectedRoute><Route path="/*" element={<>{quizRoutes}</>} /></ProtectedRoute>} />
      <Route path="/courses/*" element={<ProtectedRoute><Route path="/*" element={<>{courseRoutes}</>} /></ProtectedRoute>} />
      <Route path="/assessments/*" element={<ProtectedRoute><Route path="/*" element={<>{assessmentRoutes}</>} /></ProtectedRoute>} />
      <Route path="/media/*" element={<ProtectedRoute><Route path="/*" element={<>{mediaRoutes}</>} /></ProtectedRoute>} />
      <Route path="/interview-simulator" element={<ProtectedRoute><JobInterviewSimulator /></ProtectedRoute>} />
      <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
      <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
      <Route path="/subscription-success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
      <Route path="/subscription-canceled" element={<ProtectedRoute><SubscriptionCanceled /></ProtectedRoute>} />
      
      {/* Unprotected Routes */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/demos/*" element={<Route path="/*" element={<>{demoRoutes}</>} />} />
      
      {/* Fallback routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
