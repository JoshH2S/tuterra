
import { Route } from "react-router-dom";
import QuizGeneration from "@/pages/QuizGeneration";
import CaseStudyQuizGeneration from "@/pages/CaseStudyQuizGeneration";
import Quizzes from "@/pages/Quizzes";
import TakeQuiz from "@/pages/TakeQuiz";
import QuizResults from "@/pages/QuizResults";

export const quizRoutes = [
  <Route key="quiz-generation" path="quiz-generation" element={<QuizGeneration />} />,
  <Route key="case-study-quiz" path="case-study-quiz" element={<CaseStudyQuizGeneration />} />,
  <Route key="course-quiz-generation" path="courses/:id/quiz-generation" element={<QuizGeneration />} />,
  <Route key="quizzes" path="/" element={<Quizzes />} />,
  <Route key="take-quiz" path="take-quiz/:id" element={<TakeQuiz />} />,
  <Route key="quiz-results" path="quiz-results/:id" element={<QuizResults />} />
];
