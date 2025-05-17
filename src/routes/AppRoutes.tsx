
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import AboutUs from "@/pages/AboutUs";
import JobInterviewSimulator from "@/pages/JobInterviewSimulator";
import InternshipStart from "@/pages/InternshipStart";
import InternshipPhase2 from "@/pages/InternshipPhase2";
import InternshipPhase3 from "@/pages/InternshipPhase3";
import InternshipCompletion from "@/pages/InternshipCompletion";
import InternshipDashboard from "@/pages/InternshipDashboard";
import InterviewInvite from "@/pages/InterviewInvite";
import InternshipInterviewSimulator from "@/pages/InternshipInterviewSimulator";
import NotFound from "@/pages/NotFound";
import { PrivacyPolicy } from "@/components/legal/PrivacyPolicy";
import { TermsOfUse } from "@/components/legal/TermsOfUse";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdatePassword from "@/pages/UpdatePassword";
import PricingPage from "@/pages/PricingPage";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCanceled from "@/pages/SubscriptionCanceled";
import Contact from "@/pages/Contact";
import { ProfileSetup } from "@/components/onboarding/ProfileSetup";
import OnboardingRedirect from "@/pages/OnboardingRedirect";

// Create a ProtectedLayout component that wraps the Outlet
const ProtectedLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Auth Routes - these are already just Route elements */}
      {authRoutes}
      
      {/* Public Landing-style Routes */}
      <Route path="/about" element={<AboutUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Protected Routes with Layout */}
      <Route element={<ProtectedLayout />}>
        {/* Dashboard Routes */}
        <Route path="/dashboard">
          {dashboardRoutes}
        </Route>
        
        {/* Quiz Routes */}
        <Route path="/quizzes">
          {quizRoutes}
        </Route>
        
        {/* Course Routes */}
        <Route path="/courses">
          {courseRoutes}
        </Route>
        
        {/* Assessment Routes */}
        <Route path="/assessments">
          {assessmentRoutes}
        </Route>
        
        {/* Media Routes */}
        <Route path="/media">
          {mediaRoutes}
        </Route>
        
        {/* Interview simulator routes */}
        <Route path="/interview-simulator" element={<JobInterviewSimulator />} />
        
        {/* Regular Interview session route with ID parameter */}
        <Route path="/interview/:id" element={<JobInterviewSimulator />} />
        
        {/* Internship routes */}
        <Route path="/internship/start" element={<InternshipStart />} />
        <Route path="/internship/interview/invite/:sessionId" element={<InterviewInvite />} />
        <Route path="/internship/interview/:sessionId" element={<InternshipInterviewSimulator />} />
        <Route path="/internship/phase-2/:sessionId" element={<InternshipPhase2 />} />
        <Route path="/internship/phase-3/:sessionId" element={<InternshipPhase3 />} />
        <Route path="/internship/completion/:sessionId" element={<InternshipCompletion />} />
        <Route path="/internship/dashboard" element={<InternshipDashboard />} />
        
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/subscription-success" element={<SubscriptionSuccess />} />
        <Route path="/subscription-canceled" element={<SubscriptionCanceled />} />
      </Route>
      
      {/* Unprotected Routes */}
      <Route path="/demos/*" element={<Routes>{demoRoutes}</Routes>} />
      
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
      
      {/* Fallback routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
