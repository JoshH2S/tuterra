
import { useState, useCallback, useRef } from "react";
import { InterviewQuestion, InterviewTranscript } from "@/types/interview";

export const useInterviewState = () => {
  const [industry, setIndustry] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [isInterviewInProgress, setIsInterviewInProgress] = useState<boolean>(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<InterviewTranscript[]>([]);
  const [typingEffect, setTypingEffect] = useState<boolean>(false);
  
  // Track typing effect timer to ensure proper cleanup
  const typingTimerRef = useRef<number | null>(null);
  
  // Clear any existing typing timer
  const clearTypingTimer = useCallback(() => {
    if (typingTimerRef.current) {
      console.log("Clearing existing typing timer:", typingTimerRef.current);
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  const resetInterview = useCallback(() => {
    clearTypingTimer();
    setCurrentSessionId(null);
    setQuestions([]);
    setResponses({});
    setCurrentQuestionIndex(0);
    setIsInterviewInProgress(false);
    setIsInterviewComplete(false);
    setTranscript([]);
    setTypingEffect(false);
  }, [clearTypingTimer]);

  const startInterview = useCallback(() => {
    console.log("Starting interview, setting typing effect to true");
    setIsInterviewInProgress(true);
    setCurrentQuestionIndex(0);
    setIsInterviewComplete(false);
    setTypingEffect(true);
  }, []);

  const completeInterview = useCallback(() => {
    setIsInterviewInProgress(false);
    setIsInterviewComplete(true);
    // Ensure typing effect is off when completing
    clearTypingTimer();
    setTypingEffect(false);
  }, [clearTypingTimer]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      console.log("Moving to next question, setting typing effect to true");
      setTypingEffect(true);
    } else {
      completeInterview();
    }
  }, [currentQuestionIndex, questions.length, completeInterview]);

  const updateTranscript = useCallback(() => {
    console.log("Updating transcript with responses:", responses);
    console.log("Questions available:", questions);
    
    const newTranscript = questions.map((question) => {
      const answer = responses[question.id] || "";
      console.log(`Question ID: ${question.id}, Answer: ${answer}`);
      
      return {
        question: question.question,
        answer: answer
      };
    });
    
    console.log("Generated transcript:", newTranscript);
    setTranscript(newTranscript);
  }, [questions, responses]);

  const getCurrentQuestion = useCallback((): InterviewQuestion | null => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return null;
    }
    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

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
    responses,
    setResponses,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    isGeneratingQuestions,
    setIsGeneratingQuestions,
    isInterviewInProgress,
    setIsInterviewInProgress,
    isInterviewComplete,
    setIsInterviewComplete,
    transcript,
    setTranscript,
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
  };
};
