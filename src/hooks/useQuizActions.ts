
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Quiz } from "@/types/quiz-display";

export const useQuizActions = () => {
  const [confirmRetakeQuiz, setConfirmRetakeQuiz] = useState<Quiz | null>(null);
  const navigate = useNavigate();

  const handleViewResults = (quizId: string, quizzesByCourse: Record<string, Quiz[]>) => {
    for (const courseId in quizzesByCourse) {
      const quiz = quizzesByCourse[courseId].find(q => q.id === quizId);
      if (quiz && quiz.latest_response) {
        navigate(`/quizzes/quiz-results/${quiz.latest_response.id}`);
        return;
      }
    }
  };

  const handleStartQuiz = (quizId: string) => {
    // Use the correct path with parent route 'quizzes'
    navigate(`/quizzes/take-quiz/${quizId}`);
  };

  const handleRetakeQuiz = (quizId: string, quizzesByCourse: Record<string, Quiz[]>) => {
    for (const courseId in quizzesByCourse) {
      const quiz = quizzesByCourse[courseId].find(q => q.id === quizId);
      if (quiz) {
        setConfirmRetakeQuiz(quiz);
        return;
      }
    }
  };

  const handleRetakeConfirm = () => {
    if (confirmRetakeQuiz) {
      // Use the correct path with parent route 'quizzes'
      navigate(`/quizzes/take-quiz/${confirmRetakeQuiz.id}`);
      setConfirmRetakeQuiz(null);
    }
  };

  const handleCreateQuiz = () => {
    console.log('Navigation triggered to quiz generation');
    // Use the correct path for quiz generation
    navigate('/quizzes/quiz-generation');
  };

  return {
    confirmRetakeQuiz,
    setConfirmRetakeQuiz,
    handleViewResults,
    handleStartQuiz,
    handleRetakeQuiz,
    handleRetakeConfirm,
    handleCreateQuiz
  };
};
