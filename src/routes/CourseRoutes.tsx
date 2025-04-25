
import { Route } from "react-router-dom";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import CourseGrades from "@/pages/CourseGrades";
import CourseTemplates from "@/pages/CourseTemplates";
import LessonPlanning from "@/pages/LessonPlanning";
import CourseTutor from "@/pages/CourseTutor";

export const courseRoutes = [
  <Route key="courses" path="/" element={<Courses />} />,
  <Route key="course-detail" path=":id" element={<CourseDetail />} />,
  <Route key="course-grades" path=":id/grades" element={<CourseGrades />} />,
  <Route key="course-templates" path="course-templates" element={<CourseTemplates />} />,
  <Route key="lesson-planning" path="lesson-planning" element={<LessonPlanning />} />,
  <Route key="tutor" path="tutor" element={<CourseTutor />} />
];
