
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { FeedbackResponse, InterviewState, Question, Message, InterviewMetadata } from "@/types/interview";

interface SaveInterviewOptions {
  sessionId: string;
  state: InterviewState;
  questions: Question[];
  responses?: string[];
  transcript?: Message[];
  feedback?: FeedbackResponse | null;
  metadata?: InterviewMetadata | null;
}

export const useInterviewPersistence = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveInterview = useCallback(async (options: SaveInterviewOptions) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const { sessionId, state, questions, responses, transcript, feedback, metadata } = options;
      
      // We don't actually need to save this to Supabase for now
      // This is a placeholder for future persistence features
      // For now we just use localStorage to avoid creating new tables
      
      const interviewData = {
        sessionId,
        state,
        questions,
        responses,
        transcript,
        feedback,
        metadata,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(`interview_${sessionId}`, JSON.stringify(interviewData));
      
      return true;
    } catch (err) {
      console.error('Error saving interview:', err);
      setError(err instanceof Error ? err : new Error('Unknown error saving interview'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const loadInterview = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Retrieve from localStorage for now
      const saved = localStorage.getItem(`interview_${sessionId}`);
      
      if (!saved) {
        return null;
      }
      
      return JSON.parse(saved);
    } catch (err) {
      console.error('Error loading interview:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading interview'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    saveInterview,
    loadInterview,
    isSaving,
    isLoading,
    error
  };
};
