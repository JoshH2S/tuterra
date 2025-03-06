
import { useState, useCallback } from "react";
import { InterviewState } from "@/types/interview";
import { useToast } from "@/hooks/use-toast";

interface InterviewConfig {
  industry?: string;
  role?: string;
  jobDescription?: string;
  numberOfQuestions?: number;
  timeLimit?: number;
  sessionId?: string;
}

export const useInterviewState = (initialConfig?: Partial<InterviewConfig>) => {
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

  const { toast } = useToast();

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

  // State updates
  const updateInterviewState = useCallback((updates: Partial<InterviewState>) => {
    setInterviewState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  return {
    interviewState,
    updateInterviewState,
    validateConfig
  };
};
