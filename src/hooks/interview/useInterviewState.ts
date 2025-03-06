
import { useState, useCallback } from 'react';
import { InterviewQuestion, InterviewSession, InterviewFeedback, InterviewTranscript } from '@/types/interview';

export const useInterviewState = () => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [usedFallbackQuestions, setUsedFallbackQuestions] = useState(false);
  const [isInterviewReady, setIsInterviewReady] = useState(false);
  const [isInterviewInProgress, setIsInterviewInProgress] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track interview state
  const resetState = useCallback(() => {
    setSession(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setResponses({});
    setFeedback(null);
    setIsGeneratingQuestions(false);
    setUsedFallbackQuestions(false);
    setIsInterviewReady(false);
    setIsInterviewInProgress(false);
    setIsInterviewComplete(false);
    setError(null);
  }, []);

  // Update response for current question
  const updateResponse = useCallback((questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  }, []);

  // Get transcript of all questions and responses
  const getTranscript = useCallback((): InterviewTranscript | null => {
    if (!session || questions.length === 0) return null;
    
    return {
      sessionId: session.id,
      jobTitle: session.jobTitle,
      industry: session.industry,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        response: responses[q.id] || "No answer provided"
      }))
    };
  }, [session, questions, responses]);

  return {
    // State
    session,
    questions,
    currentQuestionIndex,
    responses,
    feedback,
    isGeneratingQuestions,
    usedFallbackQuestions,
    isInterviewReady,
    isInterviewInProgress,
    isInterviewComplete,
    error,
    
    // Setters
    setSession,
    setQuestions,
    setCurrentQuestionIndex,
    setResponses,
    setFeedback,
    setIsGeneratingQuestions,
    setUsedFallbackQuestions,
    setIsInterviewReady,
    setIsInterviewInProgress,
    setIsInterviewComplete,
    setError,
    
    // Helpers
    resetState,
    updateResponse,
    getTranscript
  };
};
