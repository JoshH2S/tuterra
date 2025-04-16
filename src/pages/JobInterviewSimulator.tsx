
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useInterviewSession } from "@/hooks/interview";
import { useInterviewQuestions } from "@/hooks/interview/useInterviewQuestions";
import { InterviewForm } from "@/components/interview/InterviewForm";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewReadyPrompt } from "@/components/interview/InterviewReadyPrompt";
import { InterviewDebug } from "@/components/interview/InterviewDebug";
import { InterviewLogo } from "@/components/interview/InterviewLogo";
import { InterviewCompletion } from "@/components/interview/InterviewCompletion";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useInterviewSetup } from "@/hooks/interview/useInterviewSetup";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/credits/UpgradePrompt";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const JobInterviewSimulator = () => {
  // Get interview ID from URL parameters
  const { id: interviewId } = useParams();
  const location = useLocation();
  const locationState = location.state || {};
  const isDetailMode = !!interviewId;
  
  // Access interview session state and handlers
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

  // Access the question generation hook
  const { generateQuestions, fetchQuestions, loading: loadingQuestions } = 
    useInterviewQuestions(currentSessionId, setQuestions);

  // Effect to sync URL parameter with interview session
  useEffect(() => {
    const setupInterview = async () => {
      if (interviewId) {
        console.log("Setting interview session from URL parameter:", interviewId);
        setCurrentSessionId(interviewId);
        
        // Try to get interview session details from location state
        if (locationState.jobTitle && locationState.industry) {
          console.log("Using location state for interview details:", {
            jobTitle: locationState.jobTitle,
            industry: locationState.industry
          });
          
          setJobTitle(locationState.jobTitle);
          setIndustry(locationState.industry);
          if (locationState.jobDescription) {
            setJobDescription(locationState.jobDescription);
          }
        }
        
        // Fetch questions for this session
        console.log("Fetching questions for session:", interviewId);
        setIsGeneratingQuestions(true);
        
        try {
          await fetchQuestions();
          console.log("Questions fetched successfully");
        } catch (error) {
          console.error("Error fetching questions:", error);
          toast({
            title: "Could not load interview questions",
            description: "We'll try to generate new ones for you.",
            variant: "destructive"
          });
          
          // Try to generate questions if we have the needed data
          if (locationState.jobTitle && locationState.industry) {
            try {
              await generateQuestions(
                locationState.industry, 
                locationState.jobTitle, 
                locationState.jobDescription || "",
                interviewId
              );
            } catch (genError) {
              console.error("Also failed to generate questions:", genError);
            }
          }
        } finally {
          setIsGeneratingQuestions(false);
        }
      }
    };
    
    setupInterview();
  }, [interviewId, setCurrentSessionId, setJobTitle, setIndustry, setJobDescription]);

  // Access interview setup state and handlers
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
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
  }>({ hasError: false, message: "" });

  // Local state for this component
  const interviewReady = questions.length > 0 && !isInterviewInProgress && !isInterviewComplete;
  const sessionCreationErrors: any[] = [];
  const usedFallbackQuestions = false;
  const isOnline = navigator.onLine;

  const handleStartInterviewWithParams = async (industry: string, title: string, description: string) => {
    console.log("handleStartInterviewWithParams called with:", {
      jobTitle: {
        value: `'${title}'`,
        length: title.length,
        trimmedLength: title.trim().length,
        timestamp: new Date().toISOString()
      }
    });
    
    // Validate inputs before processing
    if (!industry.trim()) {
      console.error("Invalid industry received:", industry);
      return;
    }
    
    if (!title || !title.trim()) {
      console.error("Invalid job title received:", title);
      return;
    }

    try {
      // Set form as submitting to prevent multiple submissions
      setFormSubmitting(true);
      
      // Update setup state values
      setupSetJobTitle(title.trim());
      setupSetIndustry(industry);
      setupSetJobDescription(description);
      
      // Also update interview session state for consistency
      setJobTitle(title.trim());
      setIndustry(industry);
      setJobDescription(description);
      
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log("State updates completed, submitting with:", {
        jobTitle: {
          value: `'${title.trim()}'`,
          length: title.trim().length,
          timestamp: new Date().toISOString()
        }
      });
      
      // Create a synthetic event to pass to handleSubmit
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      
      // Submit the form using handleSubmit from useInterviewSetup
      await handleSubmit(syntheticEvent);
    } catch (error) {
      console.error("Error during interview submission:", error);
      setErrorState({
        hasError: true,
        message: "Failed to start the interview. Please try again."
      });
    } finally {
      // Reset submission state
      setFormSubmitting(false);
    }
  };

  const handleStartNewInterview = () => {
    handleStartNew();
    // Clear any error state
    setErrorState({ hasError: false, message: "" });
  };

  const handleRetryLoading = async () => {
    if (!interviewId) return;
    
    setIsGeneratingQuestions(true);
    setErrorState({ hasError: false, message: "" });
    
    try {
      // Try to fetch questions first
      await fetchQuestions();
    } catch (error) {
      console.error("Retry fetch failed:", error);
      
      // If fetch fails and we have job details, try generation
      if (jobTitle && industry) {
        try {
          await generateQuestions(
            industry,
            jobTitle,
            jobDescription,
            interviewId
          );
        } catch (genError) {
          console.error("Retry generation also failed:", genError);
          setErrorState({
            hasError: true,
            message: "We're having trouble loading your interview. Please try again later."
          });
        }
      } else {
        setErrorState({
          hasError: true,
          message: "Missing job details. Please start a new interview."
        });
      }
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Show error message if we have an error
  if (errorState.hasError) {
    return (
      <div className="container py-4 md:py-6 max-w-5xl mx-auto px-3 sm:px-6">
        <InterviewLogo />
        <Card className="p-6 mt-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="mb-6">{errorState.message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRetryLoading} variant="outline">Retry Loading</Button>
            <Button onClick={handleStartNewInterview}>Start New Interview</Button>
          </div>
        </Card>
      </div>
    );
  }

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
        
        {/* Show loading state when generating questions */}
        {(isGeneratingQuestions || loadingQuestions) && (
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Preparing your interview questions...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a moment as we analyze the job requirements.
            </p>
          </div>
        )}
        
        {/* Only show interview form when not in detail mode and no interview is in progress */}
        {!interviewReady && !isInterviewInProgress && !isInterviewComplete && 
         !isGeneratingQuestions && !loadingQuestions && !isDetailMode && (
          <InterviewForm 
            onSubmit={handleStartInterviewWithParams} 
            isLoading={isGeneratingQuestions || isLoading || formSubmitting || loadingQuestions}
          />
        )}
        
        {interviewReady && !isInterviewInProgress && !isInterviewComplete && (
          <InterviewReadyPrompt
            jobTitle={jobTitle}
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
