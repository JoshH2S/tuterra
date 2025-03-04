import { useEffect } from "react";
import { useQuizAnswers } from "./useQuizAnswers";
import { useQuizNavigation } from "./useQuizNavigation";
import { useQuizSubmission } from "./useQuizSubmission";
import { QuizQuestion } from "./quizTypes";

export const useQuizTaking = (
  quizId: string,
  questions: QuizQuestion[],
  onSubmitSuccess?: () => void
) => {
  const {
    selectedAnswers,
    showFeedback,
    explanations,
    isGeneratingExplanation,
    handleAnswerSelect,
    resetAnswers,
    setShowFeedback
  } = useQuizAnswers(questions);

  const {
    currentQuestion,
    handleNextQuestion,
    handlePreviousQuestion,
    resetNavigation
  } = useQuizNavigation(questions.length);

  const {
    isSubmitting,
    handleSubmit
  } = useQuizSubmission(quizId, questions, selectedAnswers, onSubmitSuccess);

  // Reset state when quiz changes - ensure no pre-selected answers
  useEffect(() => {
    if (quizId && questions.length > 0) {
      resetNavigation();
      resetAnswers();
    }
  }, [quizId, questions, resetNavigation, resetAnswers]);

  return {
    // From useQuizAnswers
    selectedAnswers,
    showFeedback,
    explanations,
    isGeneratingExplanation,
    handleAnswerSelect,
    
    // From useQuizNavigation
    currentQuestion,
    handleNextQuestion,
    handlePreviousQuestion,
    
    // From useQuizSubmission
    isSubmitting,
    handleSubmit,
  };
};
