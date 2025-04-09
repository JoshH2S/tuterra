
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
        navigate(`/quiz-results/${quiz.latest_response.id}`);
        return;
      }
    }
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/take-quiz/${quizId}`);
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
      navigate(`/take-quiz/${confirmRetakeQuiz.id}`);
      setConfirmRetakeQuiz(null);
    }
  };

  const handleCreateQuiz = () => {
    console.log('Navigation triggered to quiz generation');
    // Try with leading slash, which should work based on the routes configuration
    navigate('/quiz-generation');
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
