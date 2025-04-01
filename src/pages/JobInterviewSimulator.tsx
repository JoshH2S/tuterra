
import { useEffect } from "react";
import { useInterviewSession } from "@/hooks/interview";
import { InterviewForm } from "@/components/interview/InterviewForm";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewReadyPrompt } from "@/components/interview/InterviewReadyPrompt";
import { InterviewDebug } from "@/components/interview/InterviewDebug";
import { InterviewLogo } from "@/components/interview/InterviewLogo";
import { InterviewCompletion } from "@/components/interview/InterviewCompletion";
import { Wifi, WifiOff } from "lucide-react";
import { useInterviewSetup } from "@/hooks/interview/useInterviewSetup";

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
    jobTitle,
    setJobTitle,
    loading: isLoading,
    showUpgradePrompt,
    setShowUpgradePrompt,
    handleSubmit
  } = useInterviewSetup();

  // Local state for this component
  const interviewReady = questions.length > 0 && !isInterviewInProgress && !isInterviewComplete;
  const sessionCreationErrors: any[] = [];
  const usedFallbackQuestions = false;
  const isOnline = navigator.onLine;

  const handleStartInterviewWithParams = (industry: string, role: string, description: string) => {
    setIndustry(industry);
    setJobRole(role);
    setJobDescription(description);
    
    // Submit the form using handleSubmit from useInterviewSetup
    handleSubmit(new Event('submit') as any);
  };

  const handleStartNewInterview = () => {
    handleStartNew();
  };

  return (
    <div className="container py-4 md:py-6 max-w-5xl mx-auto px-3 sm:px-6">
      <div className="space-y-4 md:space-y-8">
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
        
        <InterviewLogo />
        
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
          <InterviewCompletion
            transcript={transcript}
            onDownloadTranscript={handleDownloadTranscript}
            onStartNew={handleStartNewInterview}
          />
        )}
      </div>
    </div>
  );
};

export default JobInterviewSimulator;
