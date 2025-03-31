
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import CourseGrades from "@/pages/CourseGrades";
import CourseTemplates from "@/pages/CourseTemplates";
import LessonPlanning from "@/pages/LessonPlanning";
import CourseTutor from "@/pages/CourseTutor";

export const CourseRoutes = () => {
  return (
    <>
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id/grades"
        element={
          <ProtectedRoute>
            <CourseGrades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course-templates"
        element={
          <ProtectedRoute>
            <CourseTemplates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lesson-planning"
        element={
          <ProtectedRoute>
            <LessonPlanning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutor"
        element={
          <ProtectedRoute>
            <CourseTutor />
          </ProtectedRoute>
        }
      />
    </>
  );
};
