
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAssessmentData } from "./skill-assessment/useAssessmentData";
import { useAssessmentTimer } from "./skill-assessment/useAssessmentTimer";
import { useAssessmentNavigation } from "./skill-assessment/useAssessmentNavigation";
import { useAssessmentSubmission } from "./skill-assessment/useAssessmentSubmission";
import { AssessmentTakingState, SkillAssessment } from "./skill-assessment/types";
import { useNetworkStatus } from "./interview/useNetworkStatus";

export const useSkillAssessmentTaking = (assessmentId: string | undefined): AssessmentTakingState => {
  // Local state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState<number>(0);
  
  // Network status
  const { isOfflineMode } = useNetworkStatus();
  
  // Get assessment data
  const {
    assessment,
    loading,
    error: assessmentError,
    startAssessment,
    showUpgradePrompt,
    setShowUpgradePrompt,
    retryFetchAssessment
  } = useAssessmentData();

  // Sync errors
  if (assessmentError && !error) {
    setError(assessmentError);
  }
  
  // Initialize timer when assessment loads
  if (assessment && totalTime === 0 && assessment.time_limit) {
    setTotalTime(assessment.time_limit);
    setTimeRemaining(assessment.time_limit);
  }

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
  } = useAssessmentNavigation(assessment?.questions || []);

  // Handle submission
  const {
    isSubmitting,
    error: submissionError,
    submissionProgress,
    handleSubmit
  } = useAssessmentSubmission(
    assessment,
    answers,
    totalTime,
    timeRemaining,
    assessment?.tier || "free"
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

  // Wrap retryFetchAssessment to return a Promise
  const retry = async (): Promise<void> => {
    return retryFetchAssessment();
  };

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
    setError,
    retry,
    isOfflineMode
  };
};
