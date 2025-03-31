
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Using React.lazy for route-level components
const NotFound = lazy(() => import("@/pages/NotFound"));
const authRoutes = lazy(() => import("@/routes/AuthRoutes")).then(module => module.authRoutes);
const dashboardRoutes = lazy(() => import("@/routes/DashboardRoutes")).then(module => module.dashboardRoutes);
const courseRoutes = lazy(() => import("@/routes/CourseRoutes")).then(module => module.courseRoutes);
const quizRoutes = lazy(() => import("@/routes/QuizRoutes")).then(module => module.quizRoutes);
const mediaRoutes = lazy(() => import("@/routes/MediaRoutes")).then(module => module.mediaRoutes);
const assessmentRoutes = lazy(() => import("@/routes/AssessmentRoutes")).then(module => module.assessmentRoutes);
const demoRoutes = lazy(() => import("@/routes/DemoRoutes")).then(module => module.demoRoutes);

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {authRoutes}
        {dashboardRoutes}
        {courseRoutes}
        {quizRoutes}
        {mediaRoutes}
        {assessmentRoutes}
        {demoRoutes}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
