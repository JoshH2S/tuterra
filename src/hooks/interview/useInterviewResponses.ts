
import { useState, useCallback } from "react";
import { Message, Question } from "@/types/interview";
import { interviewTranscriptService } from "@/services/interviewTranscriptService";

export const useInterviewResponses = () => {
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [userResponses, setUserResponses] = useState<string[]>([]);

  const initializeResponses = useCallback((questionsCount: number, role: string) => {
    setUserResponses(new Array(questionsCount).fill(""));
    // Start with just the welcome message
    setTranscript([interviewTranscriptService.createWelcomeMessage(role)]);
  }, []);

  const submitResponse = useCallback((
    response: string, 
    currentQuestion: Question | undefined,
    currentQuestionIndex: number,
    saveProgress: () => void
  ) => {
    if (!currentQuestion) return;

    // Create user response message
    const userMessage = interviewTranscriptService.createUserResponseMessage(response);
    
    // Add the user's response to the transcript
    const updatedTranscript = [...transcript, userMessage];
    
    setTranscript(updatedTranscript);
    
    // Update the user responses array at the correct index
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
    // Check if this question already exists in the transcript to prevent duplicates
    const questionExists = transcript.some(msg => 
      msg.role === 'ai' && msg.id === question.id
    );
    
    if (!questionExists) {
      const questionMessage = interviewTranscriptService.createQuestionMessage(question);
      setTranscript(prev => [...prev, questionMessage]);
    }
  }, [transcript]);

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
