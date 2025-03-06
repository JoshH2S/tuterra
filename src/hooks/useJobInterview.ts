import { useEffect, useRef, useCallback } from "react";
import { useInterviewState } from "./interview/useInterviewState";
import { useInterviewQuestions } from "./interview/useInterviewQuestions";
import { useInterviewResponses } from "./interview/useInterviewResponses";
import { useInterviewFeedback } from "./interview/useInterviewFeedback";
import { useInterviewDataPersistence } from "./interview/useInterviewPersistence";
import { v4 as uuidv4 } from "@/lib/uuid";

interface InterviewConfig {
  industry?: string;
  role?: string;
  jobDescription?: string;
  numberOfQuestions?: number;
  sessionId?: string;
}

export const useJobInterview = (initialConfig?: Partial<InterviewConfig>) => {
  // State management
  const { 
    interviewState, 
    updateInterviewState, 
    validateConfig 
  } = useInterviewState(initialConfig);

  // Refs for tracking async operations and session
  const activeRequests = useRef(new Set<string>());
  const sessionId = useRef(initialConfig?.sessionId || "");

  // Questions management
  const { 
    questions, 
    metadata, 
    currentQuestion, 
    currentQuestionIndex,
    progress, 
    generateQuestions,
    advanceToNextQuestion
  } = useInterviewQuestions({
    industry: interviewState.industry,
    role: interviewState.role,
    jobDescription: interviewState.jobDescription,
    numberOfQuestions: initialConfig?.numberOfQuestions || 5,
    onStartGenerating: () => updateInterviewState({ isGenerating: true }),
    onFinishGenerating: () => updateInterviewState({ isGenerating: false })
  });

  // Responses and transcript management
  const {
    transcript,
    userResponses,
    initializeResponses,
    submitResponse,
    addQuestionToTranscript,
    addCompletionMessage,
    setTranscript
  } = useInterviewResponses();

  // Feedback management
  const {
    feedback,
    isGeneratingFeedback,
    generateFeedback,
    regenerateFeedback,
    getInterviewHistory
  } = useInterviewFeedback();

  // Persistence
  const { saveInterviewData } = useInterviewDataPersistence();

  // Helper to save current interview state
  const saveCurrentState = useCallback(() => {
    if (!sessionId.current) return;
    
    return saveInterviewData({
      sessionId: sessionId.current,
      state: interviewState,
      questions,
      responses: userResponses,
      transcript,
      feedback
    });
  }, [interviewState, questions, userResponses, transcript, feedback, saveInterviewData]);

  // Interview start logic
  const startInterview = useCallback(async () => {
    const config = {
      industry: interviewState.industry,
      role: interviewState.role,
      jobDescription: interviewState.jobDescription,
      numberOfQuestions: initialConfig?.numberOfQuestions || 5
    };

    if (!validateConfig(config)) return;

    updateInterviewState({ isStarted: true });
    
    const result = await generateQuestions(sessionId, activeRequests);
    
    if (result) {
      initializeResponses(result.questions.length, config.role);
      
      // Add the first question to the transcript
      if (result.questions.length > 0) {
        addQuestionToTranscript(result.questions[0]);
      }
      
      // Save initial interview state
      await saveInterviewData({
        sessionId: sessionId.current,
        state: interviewState,
        questions: result.questions,
        responses: new Array(result.questions.length).fill(""),
        transcript
      });
    }
  }, [
    interviewState, 
    initialConfig, 
    validateConfig, 
    generateQuestions, 
    initializeResponses, 
    addQuestionToTranscript, 
    saveInterviewData, 
    transcript, 
    updateInterviewState
  ]);

  // Response submission
  const handleSubmitResponse = useCallback((response: string) => {
    if (!currentQuestion) return;

    // Submit the response and update the transcript
    submitResponse(
      response, 
      currentQuestion, 
      currentQuestionIndex, 
      saveCurrentState
    );
    
    // Check if we can advance to the next question
    if (advanceToNextQuestion()) {
      // Add the next question to transcript
      setTimeout(() => {
        if (questions[currentQuestionIndex + 1]) {
          addQuestionToTranscript(questions[currentQuestionIndex + 1]);
        }
      }, 500);
    }
  }, [
    currentQuestion, 
    currentQuestionIndex, 
    questions, 
    submitResponse, 
    advanceToNextQuestion, 
    addQuestionToTranscript, 
    saveCurrentState
  ]);

  // Interview completion
  const completeInterview = useCallback(async () => {
    updateInterviewState({ 
      isCompleted: true, 
      isGeneratingFeedback: true 
    });
    
    // Add completion message to transcript
    const updatedTranscript = addCompletionMessage();
    
    // Generate feedback
    await generateFeedback({
      sessionId: sessionId.current,
      industry: interviewState.industry,
      role: interviewState.role,
      jobDescription: interviewState.jobDescription,
      questions,
      userResponses
    });
    
    // Save completed interview
    await saveInterviewData({
      sessionId: sessionId.current,
      state: interviewState,
      questions,
      responses: userResponses,
      transcript: updatedTranscript,
      feedback
    });
    
    updateInterviewState({ isGeneratingFeedback: false });
  }, [
    interviewState,
    questions,
    userResponses,
    generateFeedback,
    addCompletionMessage,
    saveInterviewData,
    feedback,
    updateInterviewState
  ]);

  // Convenience methods for component access
  const handleRegenerateFeedback = useCallback(() => {
    return regenerateFeedback(sessionId.current);
  }, [regenerateFeedback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRequests.current.clear();
    };
  }, []);

  return {
    // State
    industry: interviewState.industry,
    role: interviewState.role,
    jobDescription: interviewState.jobDescription,
    isInterviewStarted: interviewState.isStarted,
    isInterviewCompleted: interviewState.isCompleted,
    isGenerating: interviewState.isGenerating,
    isGeneratingFeedback,
    currentQuestionIndex,
    currentQuestion,
    questions,
    transcript,
    feedback: feedback?.detailedFeedback,
    detailedFeedback: feedback,
    interviewMetadata: metadata,
    progress,
    sessionId: sessionId.current,
    setTranscript,

    // Input setters
    setIndustry: useCallback((value: string) => 
      updateInterviewState({ industry: value }), 
      [updateInterviewState]
    ),
    setRole: useCallback((value: string) => 
      updateInterviewState({ role: value }), 
      [updateInterviewState]
    ),
    setJobDescription: useCallback((value: string) => 
      updateInterviewState({ jobDescription: value }), 
      [updateInterviewState]
    ),

    // Actions
    startInterview,
    submitResponse: handleSubmitResponse,
    completeInterview,
    regenerateFeedback: handleRegenerateFeedback,
    getInterviewHistory
  };
};
