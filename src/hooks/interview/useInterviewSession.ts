import { useEffect, useState } from "react";
import { InterviewQuestion, InterviewTranscript, InterviewPerformance } from "@/types/interview";
import { useToast } from "@/hooks/use-toast";
import { useInterviewState } from "./useInterviewState";
import { useInterviewResponses } from "./useInterviewResponses";
import { useInterviewPersistence } from "./useInterviewPersistence";
import { useSubscription } from "@/hooks/useSubscription";
import { useInterviewFeedback } from "./useInterviewFeedback";

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
  const { generateFeedback, feedback, loading: feedbackLoading } = useInterviewFeedback(currentSessionId);
  const [performance, setPerformance] = useState<InterviewPerformance | undefined>();

  useEffect(() => {
    let typingTimer: number;
    if (typingEffect && isInterviewInProgress) {
      const typingSpeed = subscription.tier !== "free" ? 1000 : 2000;
      
      typingTimer = window.setTimeout(() => {
        setTypingEffect(false);
      }, typingSpeed);
    }
    return () => clearTimeout(typingTimer);
  }, [typingEffect, isInterviewInProgress, setTypingEffect, subscription.tier]);

  useEffect(() => {
    if (isInterviewComplete) {
      console.log("Interview complete, generating transcript");
      console.log("Responses available:", Object.keys(responses).length);
      updateTranscript();
    }
  }, [isInterviewComplete, responses, updateTranscript]);

  useEffect(() => {
    const handleFeedbackGeneration = async () => {
      if (isInterviewComplete && transcript.length > 0 && !feedbackLoading && !performance) {
        try {
          await generateFeedback(transcript);
        } catch (error) {
          console.error("Error generating feedback:", error);
          toast({
            title: "Feedback Generation Error",
            description: "We couldn't generate detailed feedback for your interview.",
            variant: "destructive",
          });
        }
      }
    };

    handleFeedbackGeneration();
  }, [isInterviewComplete, transcript, generateFeedback, feedbackLoading, performance]);

  useEffect(() => {
    if (feedback && !performance) {
      setPerformance({
        score: feedback.overall_score,
        strengths: feedback.strengths,
        areasForImprovement: feedback.areas_for_improvement
      });
    }
  }, [feedback, performance]);

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
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));
    
    nextQuestion();
  };

  const handleDownloadTranscript = (format: 'txt' | 'pdf') => {
    console.log(`Downloading transcript in ${format} format`);
    downloadTranscript(transcript, jobTitle, format);
  };

  const handleSaveToProfile = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Saving interviews to your profile will be available in a future update.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Sharing interview results will be available in a future update.",
    });
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
    performance,
    currentQuestion,
    isLastQuestion,
    feedbackLoading,
    handleStartChat,
    handleSubmitResponse,
    handleDownloadTranscript,
    handleSaveToProfile,
    handleShare,
    handleStartNew
  };
};
