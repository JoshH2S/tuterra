
import { useEffect } from "react";
import { useInterviewSession } from "@/hooks/interview/useInterviewSession";
import { useInterviewSetup } from "@/hooks/interview/useInterviewSetup";
import { useInterviewFeedback } from "@/hooks/interview/useInterviewFeedback";
import { InterviewForm } from "@/components/interview/InterviewForm";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewFeedbackComponent } from "@/components/interview/InterviewFeedback";
import { InterviewReadyPrompt } from "@/components/interview/InterviewReadyPrompt";
import { InterviewDebug } from "@/components/interview/InterviewDebug";
import { Wifi, WifiOff } from "lucide-react";

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
    isLoading,
    isOnline
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
    <div className="container py-4 md:py-6 max-w-5xl mx-auto px-3 sm:px-6">
      <div className="space-y-4 md:space-y-8">
        {/* Online/Offline indicator - Mobile friendly positioning */}
        <div className="flex justify-end items-center sticky top-0 z-10 bg-opacity-90 bg-background backdrop-blur-sm py-1">
          <div className="text-xs flex items-center gap-1 text-gray-500">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-amber-500" />
                <span className="hidden sm:inline">Offline Mode</span>
              </>
            )}
          </div>
        </div>
        
        {/* Debug info - Important for showing errors */}
        <InterviewDebug sessionCreationErrors={sessionCreationErrors} />
        
        {/* Interview setup form */}
        {!interviewReady && !isInterviewInProgress && !isInterviewComplete && (
          <InterviewForm 
            onSubmit={handleStartInterviewWithParams} 
            isLoading={isGeneratingQuestions || isLoading}
          />
        )}
        
        {/* Ready to start interview */}
        {interviewReady && !isInterviewInProgress && !isInterviewComplete && (
          <InterviewReadyPrompt
            jobRole={jobRole}
            onStartChat={handleStartChat}
            usedFallbackQuestions={usedFallbackQuestions}
          />
        )}
        
        {/* Interview in progress */}
        {isInterviewInProgress && (
          <InterviewChat
            currentQuestion={currentQuestion}
            onSubmitResponse={handleSubmitResponse}
            typingEffect={typingEffect}
            onTypingComplete={() => {}} // This is handled in useInterviewSession
            isLastQuestion={isLastQuestion}
          />
        )}
        
        {/* Interview completed */}
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
