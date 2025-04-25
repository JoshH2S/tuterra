
import { Route } from "react-router-dom";
import CoursesPage from "@/pages/Courses";
import CourseDetailsPage from "@/pages/CourseDetail";
import CourseModulePage from "@/pages/CourseModulePage";
import CourseCompletionPage from "@/pages/CourseCompletionPage";

export const courseRoutes = (
  <>
    <Route index element={<CoursesPage />} />
    <Route path=":courseId" element={<CourseDetailsPage />} />
    <Route path=":courseId/module/:moduleId" element={<CourseModulePage />} />
    <Route path=":courseId/completion" element={<CourseCompletionPage />} />
  </>
);
