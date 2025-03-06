
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Message, 
  Question, 
  InterviewConfig, 
  FeedbackResponse,
  InterviewState,
  InterviewMetadata 
} from "@/types/interview";
import { interviewQuestionService } from "@/services/interviewQuestionService";
import { interviewFeedbackService } from "@/services/interviewFeedbackService";
import { interviewTranscriptService } from "@/services/interviewTranscriptService";
import { useInterviewPersistence } from "@/hooks/useInterviewPersistence";
import { v4 as uuidv4 } from "@/lib/uuid";

export const useJobInterview = (initialConfig?: Partial<InterviewConfig>) => {
  // State management with proper typing
  const [interviewState, setInterviewState] = useState<InterviewState>({
    industry: initialConfig?.industry || "",
    role: initialConfig?.role || "",
    jobDescription: initialConfig?.jobDescription || "",
    isStarted: false,
    isCompleted: false,
    isGenerating: false,
    isGeneratingFeedback: false,
    currentQuestionIndex: 0
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [metadata, setMetadata] = useState<InterviewMetadata | null>(null);

  // Refs for tracking async operations
  const activeRequests = useRef(new Set<string>());
  const sessionId = useRef(initialConfig?.sessionId || "");

  const { toast } = useToast();
  const { saveInterview, loadInterview } = useInterviewPersistence();

  // Memoized derived values
  const currentQuestion = useMemo(() => 
    questions[interviewState.currentQuestionIndex],
    [questions, interviewState.currentQuestionIndex]
  );

  const progress = useMemo(() => ({
    current: interviewState.currentQuestionIndex + 1,
    total: questions.length,
    percentage: questions.length 
      ? ((interviewState.currentQuestionIndex + 1) / questions.length) * 100 
      : 0
  }), [questions.length, interviewState.currentQuestionIndex]);

  // Input validation
  const validateConfig = useCallback((config: Partial<InterviewConfig>): boolean => {
    if (!config.industry?.trim() || !config.role?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [toast]);

  // State updates with error handling
  const updateInterviewState = useCallback((updates: Partial<InterviewState>) => {
    setInterviewState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Interview start logic
  const startInterview = useCallback(async () => {
    const config = {
      industry: interviewState.industry,
      role: interviewState.role,
      jobDescription: interviewState.jobDescription,
      numberOfQuestions: initialConfig?.numberOfQuestions || 5
    };

    if (!validateConfig(config)) return;

    const requestId = uuidv4();
    activeRequests.current.add(requestId);
    
    updateInterviewState({ 
      isStarted: true, 
      isGenerating: true 
    });

    try {
      const result = await interviewQuestionService.generateInterviewQuestions(config);
      
      if (!activeRequests.current.has(requestId)) return; // Request was cancelled

      sessionId.current = uuidv4();
      
      setQuestions(result.questions);
      setMetadata(result.metadata);
      setUserResponses(new Array(result.questions.length).fill(""));
      setTranscript([interviewTranscriptService.createWelcomeMessage(config.role)]);

      // Save initial interview state
      await saveInterview({
        sessionId: sessionId.current,
        state: interviewState,
        questions: result.questions,
        metadata: result.metadata
      });

    } catch (error) {
      console.error("Interview setup error:", error);
      toast({
        title: "Setup Error",
        description: "Failed to generate interview questions. Using fallback questions.",
        variant: "destructive",
      });
    } finally {
      if (activeRequests.current.has(requestId)) {
        activeRequests.current.delete(requestId);
        updateInterviewState({ isGenerating: false });
      }
    }
  }, [interviewState, initialConfig, validateConfig, updateInterviewState, toast, saveInterview]);

  // Response submission with debouncing
  const submitResponse = useCallback((response: string) => {
    if (!currentQuestion) return;

    const userMessage = interviewTranscriptService.createUserResponseMessage(response);
    
    // Don't re-add the current question to transcript to avoid duplication
    const updatedTranscript = [...transcript, userMessage];
    
    setTranscript(updatedTranscript);
    setUserResponses(prev => {
      const updated = [...prev];
      updated[interviewState.currentQuestionIndex] = response;
      return updated;
    });

    // Progress to next question
    if (interviewState.currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        const nextIndex = interviewState.currentQuestionIndex + 1;
        updateInterviewState({ currentQuestionIndex: nextIndex });
        
        // Add the next question to transcript
        const nextQuestion = questions[nextIndex];
        const nextQuestionMessage = interviewTranscriptService.createQuestionMessage(nextQuestion);
        setTranscript(prev => [...prev, nextQuestionMessage]);
      }, 500);
    }

    // Save progress
    saveInterview({
      sessionId: sessionId.current,
      state: interviewState,
      questions,
      responses: userResponses,
      transcript: updatedTranscript
    });
  }, [currentQuestion, transcript, interviewState, questions, userResponses, saveInterview]);

  // Interview completion with retry logic
  const completeInterview = useCallback(async () => {
    updateInterviewState({ 
      isCompleted: true, 
      isGeneratingFeedback: true 
    });
    
    // Add completion message to transcript
    const completionMessage = interviewTranscriptService.createCompletionMessage();
    setTranscript(prev => [...prev, completionMessage]);

    const retryCount = useRef(0);
    const MAX_RETRIES = 3;

    const generateFeedback = async (): Promise<void> => {
      try {
        const feedbackText = await interviewFeedbackService.generateInterviewFeedback(
          interviewState.industry,
          interviewState.role,
          interviewState.jobDescription,
          questions,
          userResponses
        );

        // Try to get detailed feedback
        let detailedFeedback: FeedbackResponse | null = null;
        try {
          const feedbackHistory = await interviewFeedbackService.getFeedbackHistory();
          if (feedbackHistory && feedbackHistory.length > 0) {
            detailedFeedback = feedbackHistory[0];
          }
        } catch (detailError) {
          console.error("Error fetching detailed feedback:", detailError);
        }

        // Use either the detailed feedback or create a simple one
        const feedbackResponse: FeedbackResponse = detailedFeedback || {
          detailedFeedback: feedbackText
        };
        
        setFeedback(feedbackResponse);
        
        // Save completed interview
        await saveInterview({
          sessionId: sessionId.current,
          state: interviewState,
          questions,
          responses: userResponses,
          transcript,
          feedback: feedbackResponse
        });

      } catch (error) {
        if (retryCount.current < MAX_RETRIES) {
          retryCount.current++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.current));
          return generateFeedback();
        }
        throw error;
      }
    };

    try {
      await generateFeedback();
    } catch (error) {
      console.error("Feedback generation error:", error);
      toast({
        title: "Feedback Error",
        description: "Failed to generate feedback. Please try regenerating.",
        variant: "destructive",
      });
    } finally {
      updateInterviewState({ isGeneratingFeedback: false });
    }
  }, [interviewState, questions, userResponses, transcript, toast, saveInterview]);

  // Regenerate feedback function
  const regenerateFeedback = useCallback(async () => {
    if (!sessionId.current) {
      toast({
        title: "Error",
        description: "No active interview session to regenerate feedback for.",
        variant: "destructive",
      });
      return;
    }
    
    updateInterviewState({ isGeneratingFeedback: true });
    
    try {
      await interviewFeedbackService.regenerateFeedback(sessionId.current);
      
      // Fetch the updated feedback
      const feedbackHistory = await interviewFeedbackService.getFeedbackHistory();
      if (feedbackHistory && feedbackHistory.length > 0) {
        const latestFeedback = feedbackHistory[0];
        setFeedback(latestFeedback);
        
        toast({
          title: "Success",
          description: "Interview feedback has been regenerated.",
        });
      }
    } catch (error) {
      console.error("Error regenerating feedback:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      updateInterviewState({ isGeneratingFeedback: false });
    }
  }, [toast, updateInterviewState]);

  // Get interview history
  const getInterviewHistory = useCallback(async () => {
    try {
      return await interviewFeedbackService.getFeedbackHistory();
    } catch (error) {
      console.error("Error fetching interview history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview history.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

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
    isGeneratingFeedback: interviewState.isGeneratingFeedback,
    currentQuestionIndex: interviewState.currentQuestionIndex,
    currentQuestion,
    questions,
    transcript,
    feedback: feedback?.detailedFeedback,
    detailedFeedback: feedback,
    interviewMetadata: metadata,
    progress,
    sessionId: sessionId.current,

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
    submitResponse,
    completeInterview,
    regenerateFeedback,
    getInterviewHistory
  };
};
