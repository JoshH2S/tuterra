
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import QuizGeneration from "@/pages/QuizGeneration";
import CaseStudyQuizGeneration from "@/pages/CaseStudyQuizGeneration";
import Quizzes from "@/pages/Quizzes";
import TakeQuiz from "@/pages/TakeQuiz";
import QuizResults from "@/pages/QuizResults";

export const quizRoutes = [
  <Route
    key="quiz-generation"
    path="/quiz-generation"
    element={
      <ProtectedRoute>
        <QuizGeneration />
      </ProtectedRoute>
    }
  />,
  <Route
    key="case-study-quiz"
    path="/case-study-quiz"
    element={
      <ProtectedRoute>
        <CaseStudyQuizGeneration />
      </ProtectedRoute>
    }
  />,
  <Route
    key="course-quiz-generation"
    path="/courses/:id/quiz-generation"
    element={
      <ProtectedRoute>
        <QuizGeneration />
      </ProtectedRoute>
    }
  />,
  <Route
    key="quizzes"
    path="/quizzes"
    element={
      <ProtectedRoute>
        <Quizzes />
      </ProtectedRoute>
    }
  />,
  <Route
    key="take-quiz"
    path="/take-quiz/:id"
    element={
      <ProtectedRoute>
        <TakeQuiz />
      </ProtectedRoute>
    }
  />,
  <Route
    key="quiz-results"
    path="/quiz-results/:id"
    element={
      <ProtectedRoute>
        <QuizResults />
      </ProtectedRoute>
    }
  />
];
