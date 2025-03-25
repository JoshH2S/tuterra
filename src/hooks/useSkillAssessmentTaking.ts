
import { useAssessmentData } from "./skill-assessment/useAssessmentData";
import { useAssessmentTimer } from "./skill-assessment/useAssessmentTimer";
import { useAssessmentNavigation } from "./skill-assessment/useAssessmentNavigation";
import { useAssessmentSubmission } from "./skill-assessment/useAssessmentSubmission";
import { AssessmentTakingState } from "./skill-assessment/types";

export const useSkillAssessmentTaking = (assessmentId: string | undefined): AssessmentTakingState => {
  // Get assessment data
  const {
    assessment,
    loading,
    userTier,
    error,
    setError,
    timeRemaining,
    setTimeRemaining,
    totalTime
  } = useAssessmentData(assessmentId);

  // Navigation between questions
  const {
    currentQuestionIndex,
    answers,
    isLastQuestion,
    currentQuestion,
    totalQuestions,
    progress,
    sections,
    handleAnswerChange,
    goToNextQuestion,
    goToPreviousQuestion
  } = useAssessmentNavigation(assessment?.questions);

  // Handle submission
  const {
    isSubmitting,
    error: submissionError,
    setError: setSubmissionError,
    submissionProgress,
    handleSubmit
  } = useAssessmentSubmission(
    assessment,
    answers,
    totalTime,
    timeRemaining,
    userTier
  );

  // Combine errors from different sources
  if (submissionError && !error) {
    setError(submissionError);
  }

  // Setup timer
  useAssessmentTimer(
    timeRemaining,
    setTimeRemaining,
    !!assessment,
    handleSubmit
  );

  return {
    assessment,
    loading,
    currentQuestionIndex,
    answers,
    timeRemaining,
    totalTime,
    isSubmitting,
    error,
    submissionProgress,
    sections,
    progress,
    isLastQuestion,
    currentQuestion,
    totalQuestions,
    handleAnswerChange,
    goToNextQuestion,
    goToPreviousQuestion,
    handleSubmit,
    setError
  };
};
