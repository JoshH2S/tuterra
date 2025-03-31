
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import QuizGeneration from "@/pages/QuizGeneration";
import CaseStudyQuizGeneration from "@/pages/CaseStudyQuizGeneration";
import Quizzes from "@/pages/Quizzes";
import TakeQuiz from "@/pages/TakeQuiz";
import QuizResults from "@/pages/QuizResults";

export const QuizRoutes = () => {
  return (
    <>
      <Route
        path="/quiz-generation"
        element={
          <ProtectedRoute>
            <QuizGeneration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/case-study-quiz"
        element={
          <ProtectedRoute>
            <CaseStudyQuizGeneration />
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
    </>
  );
};
