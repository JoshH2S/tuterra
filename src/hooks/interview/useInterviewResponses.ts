
import { useState, useCallback } from "react";
import { Message, Question } from "@/types/interview";
import { interviewTranscriptService } from "@/services/interviewTranscriptService";

export const useInterviewResponses = () => {
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);

  const initializeResponses = useCallback((questionsCount: number, role: string) => {
    setUserResponses(new Array(questionsCount).fill(""));
    setTranscript([interviewTranscriptService.createWelcomeMessage(role)]);
  }, []);

  const submitResponse = useCallback((
    response: string, 
    currentQuestion: Question | undefined,
    currentQuestionIndex: number,
    saveProgress: () => void
  ) => {
    if (!currentQuestion) return;

    const userMessage = interviewTranscriptService.createUserResponseMessage(response);
    
    // Add the user's response to the transcript
    const updatedTranscript = [...transcript, userMessage];
    
    setTranscript(updatedTranscript);
    setUserResponses(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = response;
      return updated;
    });

    // Save progress
    saveProgress();

    return updatedTranscript;
  }, [transcript]);

  const addQuestionToTranscript = useCallback((question: Question) => {
    const questionMessage = interviewTranscriptService.createQuestionMessage(question);
    setTranscript(prev => [...prev, questionMessage]);
  }, []);

  const addCompletionMessage = useCallback(() => {
    const completionMessage = interviewTranscriptService.createCompletionMessage();
    setTranscript(prev => [...prev, completionMessage]);
    return [...transcript, completionMessage];
  }, [transcript]);

  return {
    transcript,
    userResponses,
    initializeResponses,
    submitResponse,
    addQuestionToTranscript,
    addCompletionMessage,
    setTranscript
  };
};
