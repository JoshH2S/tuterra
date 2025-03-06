
import { useState, useEffect } from "react";
import { InterviewQuestion, InterviewTranscript } from "@/types/interview";
import { useToast } from "@/hooks/use-toast";
import { useInterviewState } from "./useInterviewState";
import { useInterviewResponses } from "./useInterviewResponses";
import { useInterviewPersistence } from "./useInterviewPersistence";

export const useInterviewSession = () => {
  const {
    industry,
    setIndustry,
    jobRole,
    setJobRole,
    jobDescription,
    setJobDescription,
    currentSessionId,
    setCurrentSessionId,
    questions,
    setQuestions,
    responses,
    setResponses,
    currentQuestionIndex,
    isGeneratingQuestions,
    setIsGeneratingQuestions,
    isInterviewInProgress,
    isInterviewComplete,
    transcript,
    typingEffect,
    setTypingEffect,
    resetInterview,
    startInterview,
    completeInterview,
    nextQuestion,
    updateTranscript,
    getCurrentQuestion
  } = useInterviewState();

  const { toast } = useToast();
  const { saveResponse } = useInterviewResponses(setResponses);
  const { downloadTranscript } = useInterviewPersistence();

  // When typing effect finishes
  useEffect(() => {
    let typingTimer: number;
    if (typingEffect && isInterviewInProgress) {
      typingTimer = window.setTimeout(() => {
        setTypingEffect(false);
      }, 2000); // Adjust typing speed here
    }
    return () => clearTimeout(typingTimer);
  }, [typingEffect, isInterviewInProgress, setTypingEffect]);

  // Generate transcript when interview is completed
  useEffect(() => {
    if (isInterviewComplete && Object.keys(responses).length > 0) {
      updateTranscript();
    }
  }, [isInterviewComplete, responses, updateTranscript]);

  const handleStartChat = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions generated",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
      return;
    }
    
    startInterview();
  };

  const handleSubmitResponse = async (response: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    await saveResponse(currentQuestion, response);
    nextQuestion();
  };

  const handleDownloadTranscript = (format: 'txt' | 'pdf') => {
    downloadTranscript(transcript, jobRole, format);
  };

  const handleStartNew = () => {
    resetInterview();
  };

  const currentQuestion = getCurrentQuestion();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return {
    industry,
    setIndustry,
    jobRole,
    setJobRole,
    jobDescription,
    setJobDescription,
    currentSessionId,
    setCurrentSessionId,
    questions,
    setQuestions,
    isGeneratingQuestions,
    setIsGeneratingQuestions,
    isInterviewInProgress,
    isInterviewComplete,
    typingEffect,
    transcript,
    currentQuestion,
    isLastQuestion,
    handleStartChat,
    handleSubmitResponse,
    handleDownloadTranscript,
    handleStartNew
  };
};
