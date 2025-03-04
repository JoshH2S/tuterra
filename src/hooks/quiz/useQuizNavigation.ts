
import { useState, useCallback } from "react";

export const useQuizNavigation = (totalQuestions: number) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleNextQuestion = useCallback(() => {
    if (totalQuestions > 0 && currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return true;
    }
    return false;
  }, [currentQuestion, totalQuestions]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      return true;
    }
    return false;
  }, [currentQuestion]);

  const resetNavigation = useCallback(() => {
    setCurrentQuestion(0);
  }, []);

  return {
    currentQuestion,
    handleNextQuestion,
    handlePreviousQuestion,
    resetNavigation
  };
};
