
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoadingScreen } from "@/components/ui/loading-screen";

// Lazy load pages to improve initial load time
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CourseExplorer = lazy(() => import("@/pages/CourseExplorer"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const CourseGrades = lazy(() => import("@/pages/CourseGrades"));
const AuthPage = lazy(() => import("@/pages/Auth"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmail"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AiTutor = lazy(() => import("@/pages/AiTutor"));
const JobInterviewSimulator = lazy(() => import("@/pages/JobInterviewSimulator"));
const QuizCreatorPage = lazy(() => import("@/pages/QuizCreator"));
const QuizDetail = lazy(() => import("@/pages/QuizDetail"));
const QuizTakingPage = lazy(() => import("@/pages/QuizTaking"));
const QuizResultsPage = lazy(() => import("@/pages/QuizResults"));
const SkillAssessment = lazy(() => import("@/pages/SkillAssessment"));
const AssessmentTaking = lazy(() => import("@/pages/AssessmentTaking"));
const AssessmentResults = lazy(() => import("@/pages/AssessmentResults"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
const SubscriptionSuccess = lazy(() => import("@/pages/SubscriptionSuccess"));

// Add our new internship phase 2 page
const InternshipPhase2 = lazy(() => import("@/pages/InternshipPhase2"));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/verify" element={<VerifyEmailPage />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="/courses" element={<CourseExplorer />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route
          path="/courses/:id/grades"
          element={
            <RequireAuth>
              <CourseGrades />
            </RequireAuth>
          }
        />
        <Route
          path="/tutor"
          element={
            <RequireAuth>
              <AiTutor />
            </RequireAuth>
          }
        />
        <Route path="/interview-simulator" element={<JobInterviewSimulator />} />
        <Route path="/interview/:id" element={<JobInterviewSimulator />} />
        
        {/* New route for internship phase 2 */}
        <Route
          path="/internship/phase-2"
          element={
            <RequireAuth>
              <InternshipPhase2 />
            </RequireAuth>
          }
        />
        
        <Route
          path="/quiz-creator"
          element={
            <RequireAuth>
              <QuizCreatorPage />
            </RequireAuth>
          }
        />
        <Route path="/quiz/:id" element={<QuizDetail />} />
        <Route path="/quiz/:id/take" element={<QuizTakingPage />} />
        <Route path="/quiz/:id/results" element={<QuizResultsPage />} />
        <Route path="/skill-assessment" element={<SkillAssessment />} />
        <Route path="/assessment/:id/take" element={<AssessmentTaking />} />
        <Route path="/assessment/:id/results" element={<AssessmentResults />} />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

// Simple loading spinner for route transitions
const LoadingIndicator = () => (
  <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
