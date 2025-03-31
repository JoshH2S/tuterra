
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import CourseGrades from "@/pages/CourseGrades";
import CourseTemplates from "@/pages/CourseTemplates";
import LessonPlanning from "@/pages/LessonPlanning";
import CourseTutor from "@/pages/CourseTutor";

export const courseRoutes = [
  <Route
    key="courses"
    path="/courses"
    element={
      <ProtectedRoute>
        <Courses />
      </ProtectedRoute>
    }
  />,
  <Route
    key="course-detail"
    path="/courses/:id"
    element={
      <ProtectedRoute>
        <CourseDetail />
      </ProtectedRoute>
    }
  />,
  <Route
    key="course-grades"
    path="/courses/:id/grades"
    element={
      <ProtectedRoute>
        <CourseGrades />
      </ProtectedRoute>
    }
  />,
  <Route
    key="course-templates"
    path="/course-templates"
    element={
      <ProtectedRoute>
        <CourseTemplates />
      </ProtectedRoute>
    }
  />,
  <Route
    key="lesson-planning"
    path="/lesson-planning"
    element={
      <ProtectedRoute>
        <LessonPlanning />
      </ProtectedRoute>
    }
  />,
  <Route
    key="tutor"
    path="/tutor"
    element={
      <ProtectedRoute>
        <CourseTutor />
      </ProtectedRoute>
    }
  />
];
