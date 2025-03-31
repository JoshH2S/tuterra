
import { Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { authRoutes } from "@/routes/AuthRoutes";
import { dashboardRoutes } from "@/routes/DashboardRoutes";
import { courseRoutes } from "@/routes/CourseRoutes";
import { quizRoutes } from "@/routes/QuizRoutes";
import { mediaRoutes } from "@/routes/MediaRoutes";
import { assessmentRoutes } from "@/routes/AssessmentRoutes";
import { demoRoutes } from "@/routes/DemoRoutes";

export const AppRoutes = () => {
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
