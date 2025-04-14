
import { useEffect, useState } from "react";
import { useInterviewSession } from "@/hooks/interview";
import { InterviewForm } from "@/components/interview/InterviewForm";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewReadyPrompt } from "@/components/interview/InterviewReadyPrompt";
import { InterviewDebug } from "@/components/interview/InterviewDebug";
import { InterviewLogo } from "@/components/interview/InterviewLogo";
import { InterviewCompletion } from "@/components/interview/InterviewCompletion";
import { Wifi, WifiOff } from "lucide-react";
import { useInterviewSetup } from "@/hooks/interview/useInterviewSetup";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/credits/UpgradePrompt";

const JobInterviewSimulator = () => {
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
    jobTitle: setupJobTitle,
    setJobTitle: setSetupJobTitle,
    industry: setupIndustry,
    setIndustry: setSetupIndustry,
    jobDescription: setupJobDescription,
    setJobDescription: setSetupJobDescription,
    loading: isLoading,
    showUpgradePrompt,
    setShowUpgradePrompt,
    handleSubmit
  } = useInterviewSetup();

  const { subscription } = useSubscription();
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Local state for this component
  const interviewReady = questions.length > 0 && !isInterviewInProgress && !isInterviewComplete;
  const sessionCreationErrors: any[] = [];
  const usedFallbackQuestions = false;
  const isOnline = navigator.onLine;

  const handleStartInterviewWithParams = async (industry: string, jobRole: string, description: string) => {
    console.log("Starting interview with params:", { 
      industry, 
      jobRole: {
        value: `'${jobRole}'`, 
        type: typeof jobRole,
        length: jobRole?.length || 0,
        trimmed: jobRole?.trim()
      }
    });
    
    // Validate inputs before processing
    if (!industry?.trim()) {
      console.error("Invalid industry received:", industry);
      return;
    }
    
    if (!jobRole?.trim()) {
      console.error("Invalid job role received:", jobRole);
      return;
    }

    // Set form as submitting to prevent multiple submissions
    setFormSubmitting(true);
    
    try {
      // IMPORTANT: Use the setupJobTitle from useInterviewSetup hook
      setSetupJobTitle(jobRole.trim());
      setSetupIndustry(industry.trim());
      setSetupJobDescription(description);
      
      // Wait for state updates to complete - this is crucial
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log("State before submission:", {
        jobTitle: setupJobTitle,
        newJobTitle: jobRole.trim(),
        industry: setupIndustry,
        newIndustry: industry.trim()
      });
      
      // Create a synthetic event to pass to handleSubmit
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      
      // Submit the form using handleSubmit from useInterviewSetup
      await handleSubmit(syntheticEvent);
    } catch (error) {
      console.error("Error during interview submission:", error);
    } finally {
      // Reset submission state
      setFormSubmitting(false);
    }
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
            isLoading={isGeneratingQuestions || isLoading || formSubmitting}
          />
        )}
        
        {interviewReady && !isInterviewInProgress && !isInterviewComplete && (
          <InterviewReadyPrompt
            jobRole={jobTitle || setupJobTitle} // Use either source
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
      
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        featureType="interview"
      />
    </div>
  );
};

export default JobInterviewSimulator;
