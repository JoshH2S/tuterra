
import { useEffect } from "react";
import { useInterviewSession } from "@/hooks/interview/useInterviewSession";
import { useInterviewSetup } from "@/hooks/interview/useInterviewSetup";
import { useInterviewFeedback } from "@/hooks/interview/useInterviewFeedback";
import { InterviewForm } from "@/components/interview/InterviewForm";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewFeedbackComponent } from "@/components/interview/InterviewFeedback";
import { InterviewReadyPrompt } from "@/components/interview/InterviewReadyPrompt";
import { InterviewDebug } from "@/components/interview/InterviewDebug";

const JobInterviewSimulator = () => {
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
  } = useInterviewSession();

  const {
    handleStartInterview,
    interviewReady,
    setInterviewReady,
    sessionCreationErrors,
    usedFallbackQuestions,
    isLoading
  } = useInterviewSetup(setCurrentSessionId, setQuestions, setIsGeneratingQuestions);

  const { generateFeedback, feedback, loading: feedbackLoading } = useInterviewFeedback(currentSessionId);

  // Generate feedback when transcript is ready
  useEffect(() => {
    if (isInterviewComplete && transcript.length > 0 && !feedback) {
      generateFeedback(transcript);
    }
  }, [isInterviewComplete, transcript, feedback, generateFeedback]);

  const handleStartInterviewWithParams = (industry: string, jobRole: string, jobDescription: string) => {
    setIndustry(industry);
    setJobRole(jobRole);
    setJobDescription(jobDescription);
    handleStartInterview(industry, jobRole, jobDescription);
  };

  const handleStartNewInterview = () => {
    handleStartNew();
    setInterviewReady(false);
  };

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="space-y-8">
        <InterviewDebug sessionCreationErrors={sessionCreationErrors} />
        
        {!interviewReady && !isInterviewInProgress && !isInterviewComplete && (
          <InterviewForm 
            onSubmit={handleStartInterviewWithParams} 
            isLoading={isGeneratingQuestions || isLoading}
          />
        )}
        
        {interviewReady && !isInterviewInProgress && !isInterviewComplete && (
          <InterviewReadyPrompt
            jobRole={jobRole}
            onStartChat={handleStartChat}
            usedFallbackQuestions={usedFallbackQuestions}
          />
        )}
        
        {isInterviewInProgress && (
          <InterviewChat
            currentQuestion={currentQuestion}
            onSubmitResponse={handleSubmitResponse}
            typingEffect={typingEffect}
            onTypingComplete={() => {}} // This is handled in useInterviewSession
            isLastQuestion={isLastQuestion}
          />
        )}
        
        {isInterviewComplete && (
          <InterviewFeedbackComponent
            feedback={feedback}
            transcript={transcript}
            onDownloadTranscript={handleDownloadTranscript}
            onStartNew={handleStartNewInterview}
            loading={feedbackLoading}
          />
        )}
      </div>
    </div>
  );
};

export default JobInterviewSimulator;
