
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Quiz } from "@/types/quiz-display";

export const useQuizActions = () => {
  const [confirmRetakeQuiz, setConfirmRetakeQuiz] = useState<Quiz | null>(null);
  const [quizzesWithProgress, setQuizzesWithProgress] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Check localStorage for any quizzes with saved progress
  useEffect(() => {
    const progressQuizIds = new Set<string>();
    
    // Find all quiz_progress_* items in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quiz_progress_')) {
        const quizId = key.replace('quiz_progress_', '');
        progressQuizIds.add(quizId);
      }
    }
    
    setQuizzesWithProgress(progressQuizIds);
  }, []);

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

  const hasQuizProgress = (quizId: string) => {
    return quizzesWithProgress.has(quizId);
  };

  return {
    confirmRetakeQuiz,
    setConfirmRetakeQuiz,
    handleViewResults,
    handleStartQuiz,
    handleRetakeQuiz,
    handleRetakeConfirm,
    handleCreateQuiz,
    hasQuizProgress
  };
};
