
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const { id: interviewId } = useParams();
  
  // Initialize interview modes based on URL parameters
  const isDetailMode = !!interviewId;
  
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

  // Effect to sync the URL parameter with the interview session
  useEffect(() => {
    if (interviewId) {
      console.log("Setting interview session from URL parameter:", interviewId);
      setCurrentSessionId(interviewId);
    }
  }, [interviewId, setCurrentSessionId]);

  const {
    jobTitle: setupJobTitle,
    setJobTitle: setupSetJobTitle,
    industry: setupIndustry,
    setIndustry: setupSetIndustry,
    jobDescription: setupJobDescription,
    setJobDescription: setupSetJobDescription,
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

  const handleStartInterviewWithParams = async (industry: string, role: string, description: string) => {
    console.log("Starting interview with params:", { 
      industry, 
      role: `'${role}'`, 
      roleLength: role.length,
      description: description.substring(0, 50) + "..." 
    });
    
    // Validate inputs before processing
    if (!industry.trim()) {
      console.error("Invalid industry received:", industry);
      return;
    }
    
    if (!role || !role.trim()) {
      console.error("Invalid job role received:", role);
      return;
    }

    // Set form as submitting to prevent multiple submissions
    setFormSubmitting(true);
    
    try {
      // Update setup state values
      setupSetJobTitle(role.trim());
      setupSetIndustry(industry);
      setupSetJobDescription(description);
      
      // Also update interview session state for consistency
      setJobRole(role.trim());
      setIndustry(industry);
      setJobDescription(description);
      
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log("Submitting with state values:", {
        setupJobTitle: role.trim(),
        setupIndustry: industry,
        jobRole: role.trim(),
        setupJobDescription: description.length,
        setupJobTitleLength: role.trim().length
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
        
        {!interviewReady && !isInterviewInProgress && !isInterviewComplete && !isDetailMode && (
          <InterviewForm 
            onSubmit={handleStartInterviewWithParams} 
            isLoading={isGeneratingQuestions || isLoading || formSubmitting}
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
      
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        featureType="interview"
      />
    </div>
  );
};

export default JobInterviewSimulator;
