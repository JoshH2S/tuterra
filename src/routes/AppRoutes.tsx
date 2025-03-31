
import { Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { AuthRoutes } from "@/routes/AuthRoutes";
import { DashboardRoutes } from "@/routes/DashboardRoutes";
import { CourseRoutes } from "@/routes/CourseRoutes";
import { QuizRoutes } from "@/routes/QuizRoutes";
import { MediaRoutes } from "@/routes/MediaRoutes";
import { AssessmentRoutes } from "@/routes/AssessmentRoutes";
import { DemoRoutes } from "@/routes/DemoRoutes";

export const AppRoutes = () => {
  return (
    <Routes>
      <AuthRoutes />
      <DashboardRoutes />
      <CourseRoutes />
      <QuizRoutes />
      <MediaRoutes />
      <AssessmentRoutes />
      <DemoRoutes />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
