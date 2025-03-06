
import { useState } from "react";
import { InterviewQuestion, InterviewResponse, InterviewTranscript } from "@/types/interview";

export const useInterviewState = () => {
  const [industry, setIndustry] = useState<string>("");
  const [jobRole, setJobRole] = useState<string>("");
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

  const resetInterview = () => {
    setCurrentSessionId(null);
    setQuestions([]);
    setResponses({});
    setCurrentQuestionIndex(0);
    setIsInterviewInProgress(false);
    setIsInterviewComplete(false);
    setTranscript([]);
    setTypingEffect(false);
  };

  const startInterview = () => {
    setIsInterviewInProgress(true);
    setCurrentQuestionIndex(0);
    setIsInterviewComplete(false);
    setTypingEffect(true);
  };

  const completeInterview = () => {
    setIsInterviewInProgress(false);
    setIsInterviewComplete(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setTypingEffect(true);
    } else {
      completeInterview();
    }
  };

  const updateTranscript = () => {
    const newTranscript = questions.map((question, index) => ({
      question: question.question,
      answer: responses[question.id] || ""
    }));
    setTranscript(newTranscript);
  };

  const getCurrentQuestion = (): InterviewQuestion | null => {
    if (questions.length === 0 || currentQuestionIndex >= questions.length) {
      return null;
    }
    return questions[currentQuestionIndex];
  };

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
    resetInterview,
    startInterview,
    completeInterview,
    nextQuestion,
    updateTranscript,
    getCurrentQuestion
  };
};
