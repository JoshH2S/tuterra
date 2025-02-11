
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "@/pages/Auth";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import LessonPlanning from "@/pages/LessonPlanning";
import QuizGeneration from "@/pages/QuizGeneration";
import CourseTutor from "@/pages/CourseTutor";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Index from "@/pages/Index";
import Quizzes from "@/pages/Quizzes";
import TakeQuiz from "@/pages/TakeQuiz";
import QuizResults from "@/pages/QuizResults";
import StudentDashboard from "@/pages/StudentDashboard";
import ProfileSettings from "@/pages/ProfileSettings";
import UpdatePassword from "@/pages/UpdatePassword";
import StudyGroups from "@/pages/StudyGroups";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/verify-email" element={<Auth mode="emailVerification" />} />
      <Route path="/reset-password" element={<Auth mode="resetPassword" />} />
      <Route
        path="/update-password"
        element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-settings"
        element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
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
        path="/lesson-planning"
        element={
          <ProtectedRoute>
            <LessonPlanning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-generation"
        element={
          <ProtectedRoute>
            <QuizGeneration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id/quiz-generation"
        element={
          <ProtectedRoute>
            <QuizGeneration />
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
      <Route
        path="/quizzes"
        element={
          <ProtectedRoute>
            <Quizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/take-quiz/:id"
        element={
          <ProtectedRoute>
            <TakeQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz-results/:id"
        element={
          <ProtectedRoute>
            <QuizResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/study-groups"
        element={
          <ProtectedRoute>
            <StudyGroups />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
