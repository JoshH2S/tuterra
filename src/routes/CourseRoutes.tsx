
import { Route } from "react-router-dom";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import CourseGrades from "@/pages/CourseGrades";
import CourseTemplates from "@/pages/CourseTemplates";
import LessonPlanning from "@/pages/LessonPlanning";
import GeneratedCourseDashboard from "@/pages/GeneratedCourseDashboard";
import GeneratedCourseDetail from "@/pages/GeneratedCourseDetail";
import CourseRunnerPage from "@/pages/CourseRunnerPage";

export const courseRoutes = [
  <Route key="courses" path="/" element={<Courses />} />,
  <Route key="course-detail" path=":id" element={<CourseDetail />} />,
  <Route key="course-grades" path=":id/grades" element={<CourseGrades />} />,
  <Route key="course-templates" path="course-templates" element={<CourseTemplates />} />,
  <Route key="lesson-planning" path="lesson-planning" element={<LessonPlanning />} />,
  <Route key="generated-courses" path="generated" element={<GeneratedCourseDashboard />} />,
  <Route key="generated-course-detail" path="generated/:id" element={<GeneratedCourseDetail />} />,
  <Route key="course-runner" path="generated/:id/learn" element={<CourseRunnerPage />} />,
];
