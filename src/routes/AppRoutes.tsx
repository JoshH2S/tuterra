
import { lazy, Suspense, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { lazyLoad } from "@/utils/lazy-loading";

// Using React.lazy for route-level components with default exports
const NotFound = lazyLoad(() => import("@/pages/NotFound"), "NotFound");

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export const AppRoutes = () => {
  // State to hold our dynamically loaded route components
  const [authRoutes, setAuthRoutes] = useState<React.ReactNode[]>([]);
  const [dashboardRoutes, setDashboardRoutes] = useState<React.ReactNode[]>([]);
  const [courseRoutes, setCourseRoutes] = useState<React.ReactNode[]>([]);
  const [quizRoutes, setQuizRoutes] = useState<React.ReactNode[]>([]);
  const [mediaRoutes, setMediaRoutes] = useState<React.ReactNode[]>([]);
  const [assessmentRoutes, setAssessmentRoutes] = useState<React.ReactNode[]>([]);
  const [demoRoutes, setDemoRoutes] = useState<React.ReactNode[]>([]);
  const [routesLoaded, setRoutesLoaded] = useState(false);

  useEffect(() => {
    // Load all route modules
    const loadRoutes = async () => {
      try {
        // Import route modules
        const [
          authModule,
          dashboardModule,
          courseModule,
          quizModule,
          mediaModule,
          assessmentModule,
          demoModule
        ] = await Promise.all([
          import("@/routes/AuthRoutes"),
          import("@/routes/DashboardRoutes"),
          import("@/routes/CourseRoutes"),
          import("@/routes/QuizRoutes"),
          import("@/routes/MediaRoutes"),
          import("@/routes/AssessmentRoutes"),
          import("@/routes/DemoRoutes")
        ]);

        // Set route components from modules
        setAuthRoutes(authModule.authRoutes);
        setDashboardRoutes(dashboardModule.dashboardRoutes);
        setCourseRoutes(courseModule.courseRoutes);
        setQuizRoutes(quizModule.quizRoutes);
        setMediaRoutes(mediaModule.mediaRoutes);
        setAssessmentRoutes(assessmentModule.assessmentRoutes);
        setDemoRoutes(demoModule.demoRoutes);
        setRoutesLoaded(true);
      } catch (error) {
        console.error("Error loading routes:", error);
      }
    };

    loadRoutes();
  }, []);

  if (!routesLoaded) {
    return <LoadingFallback />;
  }

  return (
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
  );
};
