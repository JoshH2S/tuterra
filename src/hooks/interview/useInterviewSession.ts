
import { useEffect } from "react";
import { InterviewQuestion, InterviewTranscript } from "@/types/interview";
import { useToast } from "@/hooks/use-toast";
import { useInterviewState } from "./useInterviewState";
import { useInterviewResponses } from "./useInterviewResponses";
import { useInterviewPersistence } from "./useInterviewPersistence";
import { useSubscription } from "@/hooks/useSubscription";

export const useInterviewSession = () => {
  const {
    industry,
    setIndustry,
    jobTitle,
    setJobTitle,
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
    typingTimerRef,
    clearTypingTimer,
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
  const { subscription } = useSubscription();

  // When typing effect starts, set a timer to end it
  useEffect(() => {
    if (typingEffect && isInterviewInProgress) {
      // Clear any existing timer first
      clearTypingTimer();
      
      // Premium users get faster typing
      const typingSpeed = subscription.tier !== "free" ? 1500 : 2500;
      
      console.log(`Setting typing effect timer for ${typingSpeed}ms`);
      
      // Set new timer and store its ID
      typingTimerRef.current = window.setTimeout(() => {
        console.log("Typing effect timer completed, setting typingEffect to false");
        setTypingEffect(false);
      }, typingSpeed);
    }
    
    return () => {
      clearTypingTimer();
    };
  }, [typingEffect, isInterviewInProgress, setTypingEffect, subscription.tier, typingTimerRef, clearTypingTimer]);

  // Generate transcript when interview is completed
  useEffect(() => {
    if (isInterviewComplete) {
      console.log("Interview complete, generating transcript");
      console.log("Responses available:", Object.keys(responses).length);
      updateTranscript();
    }
  }, [isInterviewComplete, responses, updateTranscript]);

  const handleStartChat = () => {
    if (questions.length === 0) {
      console.error("Cannot start chat: No questions generated");
      toast({
        title: "No questions generated",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Starting interview chat with questions:", questions.length);
    startInterview();
  };

  const handleSubmitResponse = async (response: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      console.error("Cannot submit response: No current question found");
      return;
    }
    
    console.log(`Submitting response for question ${currentQuestionIndex + 1}/${questions.length}`);
    console.log(`Response text: "${response}" for question ID: ${currentQuestion.id}`);
    
    await saveResponse(currentQuestion, response);
    
    // Update responses manually to ensure we have the latest
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));
    
    nextQuestion();
  };

  const handleTypingComplete = () => {
    console.log("Typing effect complete callback from child component");
    setTypingEffect(false);
  };

  const handleDownloadTranscript = (format: 'txt' | 'pdf') => {
    console.log(`Downloading transcript in ${format} format`);
    downloadTranscript(transcript, jobTitle, format);
  };

  const handleStartNew = () => {
    console.log("Starting new interview, resetting state");
    resetInterview();
  };

  const currentQuestion = getCurrentQuestion();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return {
    industry,
    setIndustry,
    jobTitle,
    setJobTitle,
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
    handleStartNew,
    handleTypingComplete
  };
};
