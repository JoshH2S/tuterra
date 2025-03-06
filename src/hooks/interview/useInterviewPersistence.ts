
import { useCallback } from "react";
import { useInterviewPersistence as useOriginalPersistence } from "@/hooks/useInterviewPersistence";
import { InterviewState, Question, Message, FeedbackResponse, InterviewMetadata } from "@/types/interview";

interface SaveData {
  sessionId: string;
  state: InterviewState;
  questions: Question[];
  responses: string[];
  transcript: Message[];
  feedback?: FeedbackResponse | null;
}

export const useInterviewDataPersistence = () => {
  const { saveInterview, loadInterview, isSaving, isLoading, error } = useOriginalPersistence();
  
  const saveInterviewData = useCallback(async ({
    sessionId,
    state,
    questions,
    responses,
    transcript,
    feedback = null
  }: SaveData) => {
    return await saveInterview({
      sessionId,
      state,
      questions,
      responses,
      transcript,
      feedback,
      metadata: null // We'll add metadata later if needed
    });
  }, [saveInterview]);

  return {
    saveInterviewData,
    loadInterview,
    isSaving,
    isLoading,
    error
  };
};
