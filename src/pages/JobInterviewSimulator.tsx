
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
import { useNetworkStatus } from "@/hooks/interview/useNetworkStatus";

const JobInterviewSimulator = () => {
  const { id: interviewId } = useParams();
  const location = useLocation();
  const locationState = location.state || {};
  const isDetailMode = !!interviewId;
  const { isOnline, hasConnectionError } = useNetworkStatus();
  
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

  const { generateQuestions, fetchQuestions, loading: loadingQuestions } = 
    useInterviewQuestions(currentSessionId, setQuestions);

  useEffect(() => {
    const setupInterview = async () => {
      if (interviewId) {
        console.log("Setting interview session from URL parameter:", interviewId);
        setCurrentSessionId(interviewId);
        
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

  const interviewReady = questions.length > 0 && !isInterviewInProgress && !isInterviewComplete;
  const sessionCreationErrors: string[] = [];
  const usedFallbackQuestions = false;

  const handleStartInterviewWithParams = async (industry: string, title: string, description: string) => {
    console.log("handleStartInterviewWithParams called with:", {
      jobTitle: {
        value: `'${title}'`,
        length: title.length,
        trimmedLength: title.trim().length,
        timestamp: new Date().toISOString()
      }
    });
    
    if (!industry.trim()) {
      console.error("Invalid industry received");
      return;
    }
    
    if (!title.trim()) {
      console.error("Invalid job title received");
      return;
    }

    try {
      setFormSubmitting(true);
      
      const trimmedTitle = title.trim();
      const trimmedIndustry = industry.trim();
      const trimmedDescription = description.trim();
      
      setupSetJobTitle(trimmedTitle);
      setupSetIndustry(trimmedIndustry);
      setupSetJobDescription(trimmedDescription);
      
      setJobTitle(trimmedTitle);
      setIndustry(trimmedIndustry);
      setJobDescription(trimmedDescription);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log("State updates completed, submitting with:", {
        jobTitle: {
          value: `'${title.trim()}'`,
          length: title.trim().length,
          timestamp: new Date().toISOString()
        }
      });
      
      const syntheticEvent = {
        preventDefault: () => {}
      } as React.FormEvent;
      
      await handleSubmit(syntheticEvent);
    } catch (error) {
      console.error("Error during interview submission:", error);
      setErrorState({
        hasError: true,
        message: "Failed to start the interview. Please try again."
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStartNewInterview = () => {
    handleStartNew();
    setErrorState({ hasError: false, message: "" });
  };

  const handleRetryLoading = async () => {
    if (!interviewId) return;
    
    setIsGeneratingQuestions(true);
    setErrorState({ hasError: false, message: "" });
    
    try {
      await fetchQuestions();
    } catch (error) {
      console.error("Retry fetch failed:", error);
      
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

  // Display API connection error if detected
  if (hasConnectionError && !errorState.hasError) {
    return (
      <div className="container py-4 md:py-6 max-w-5xl mx-auto px-3 sm:px-6">
        <InterviewLogo />
        <Card className="p-6 mt-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">API Connection Error</h2>
          <p className="mb-6">
            We're having trouble connecting to our services. This might be due to API key authentication issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">Refresh Page</Button>
            <Button onClick={handleStartNewInterview}>Start New Interview</Button>
          </div>
        </Card>
      </div>
    );
  }

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
        
        {(isGeneratingQuestions || loadingQuestions) && (
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Preparing your interview questions...</p>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a moment as we analyze the job requirements.
            </p>
          </div>
        )}
        
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
            onTypingComplete={() => {}}
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
