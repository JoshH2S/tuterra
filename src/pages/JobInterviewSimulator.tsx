import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useInterviewSession } from "@/hooks/interview";
import { useInterviewQuestions } from "@/hooks/interview/useInterviewQuestions";
import { useInterviewGeneration } from "@/hooks/interview/useInterviewGeneration";
import { useInterviewFeedback } from "@/hooks/interview/useInterviewFeedback";
import { MultiStepInterviewForm, ExtendedInterviewFormData } from "@/components/interview/MultiStepInterviewForm";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewReadyPrompt } from "@/components/interview/InterviewReadyPrompt";
import { InterviewDebug } from "@/components/interview/InterviewDebug";
import { InterviewFeedbackComponent } from "@/components/interview/InterviewFeedback";
import { Wifi, WifiOff, AlertCircle, BrainCircuit, Plus } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/credits/UpgradePrompt";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNetworkStatus } from "@/hooks/interview/useNetworkStatus";
import { InterviewLogo } from "@/components/interview/InterviewLogo";
import { InterviewCompletion } from "@/components/interview/InterviewCompletion";

const JobInterviewSimulator = () => {
  const { id: interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = ((location.state as {
    topic?: string;
    autoCreate?: boolean;
    jobTitle?: string;
    industry?: string;
    jobDescription?: string;
  } | null) ?? {});
  const searchParams = new URLSearchParams(location.search);
  const quickStartTopic = locationState?.topic ?? searchParams.get("topic") ?? "";
  const shouldSkipIndustry =
    (locationState?.autoCreate || searchParams.get("quickstart") === "1") &&
    quickStartTopic.trim().length > 0;
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
    currentQuestionIndex,
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

  const { 
    generateInterview,
    isGenerating,
    progress
  } = useInterviewGeneration();

  const { subscription } = useSubscription();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [errorState, setErrorState] = useState<{
    hasError: boolean;
    message: string;
  }>({ hasError: false, message: "" });

  // Feedback hook
  const {
    feedback,
    isGenerating: isGeneratingFeedback,
    hasError: feedbackError,
    generateFeedback,
    fetchExistingFeedback,
    retryGeneration,
    resetFeedback
  } = useInterviewFeedback();

  useEffect(() => {
    const setupInterview = async () => {
      if (interviewId) {
        console.log("Setting interview session from URL parameter:", interviewId);
        setCurrentSessionId(interviewId);
        
        if (locationState.jobTitle) {
          console.log("Using location state for interview details:", {
            jobTitle: locationState.jobTitle,
            industry: locationState.industry
          });
          
          setJobTitle(locationState.jobTitle);
          setIndustry(locationState.industry ?? "");
          if (locationState.jobDescription) {
            setJobDescription(locationState.jobDescription);
          }
        }
        
        console.log("Fetching questions for session:", interviewId);
        setIsGeneratingQuestions(true);
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await fetchQuestions(interviewId);
          console.log("Questions fetched successfully");
        } catch (error) {
          console.error("Error fetching questions:", error);
          toast({
            title: "Could not load interview questions",
            description: "We'll try to generate new ones for you.",
            variant: "destructive"
          });
          
          if (locationState.jobTitle) {
            try {
              await new Promise(resolve => setTimeout(resolve, 500));
              await generateQuestions(
                locationState.industry ?? "",
                locationState.jobTitle, 
                locationState.jobDescription || "",
                interviewId
              );
            } catch (genError) {
              console.error("Also failed to generate questions:", genError);
              setErrorState({
                hasError: true,
                message: "We're having trouble loading your interview. Please try again later."
              });
            }
          }
        } finally {
          setIsGeneratingQuestions(false);
        }
      }
    };
    
    setupInterview();
  }, [interviewId, locationState.jobTitle, locationState.industry, locationState.jobDescription, fetchQuestions, generateQuestions, setCurrentSessionId, setJobTitle, setIndustry, setJobDescription]);

  const interviewReady = questions.length > 0 && !isInterviewInProgress && !isInterviewComplete;
  const sessionCreationErrors: string[] = [];
  const usedFallbackQuestions = false;

  const handleFormSubmit = async (data: ExtendedInterviewFormData) => {
    try {
      const result = await generateInterview({
        industry: data.industry,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        practiceMode: data.practiceMode,
      });
      
      if (!result) {
        throw new Error("Failed to generate interview");
      }
      
      const { questions: generatedQuestions, sessionId } = result;
      
      setJobTitle(data.jobTitle);
      setIndustry(data.industry);
      setJobDescription(data.jobDescription);
      setCurrentSessionId(sessionId);
      setQuestions(generatedQuestions);
      
      navigate(`/interview/${sessionId}`, { 
        state: { 
          sessionId,
          jobTitle: data.jobTitle,
          industry: data.industry,
          jobDescription: data.jobDescription
        }
      });
    } catch (error) {
      console.error("Error generating interview:", error);
      toast({
        title: "Failed to generate interview",
        description: "There was a problem creating your interview. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStartNewInterview = () => {
    handleStartNew();
    setErrorState({ hasError: false, message: "" });
    setShowFeedback(false);
    resetFeedback();
  };

  const handleViewFeedback = async () => {
    if (!currentSessionId || transcript.length === 0) {
      toast({
        title: "Cannot Generate Feedback",
        description: "Missing session data or transcript.",
        variant: "destructive",
      });
      return;
    }

    setShowFeedback(true);
    
    // First try to fetch existing feedback
    await fetchExistingFeedback(currentSessionId);
    
    // If no existing feedback, generate new one
    if (!feedback) {
      await generateFeedback(currentSessionId, transcript);
    }
  };

  const handleRetryFeedback = async () => {
    if (currentSessionId && transcript.length > 0) {
      await retryGeneration(currentSessionId, transcript);
    }
  };

  const handleRetryLoading = async () => {
    if (!interviewId) return;
    
    setIsGeneratingQuestions(true);
    setErrorState({ hasError: false, message: "" });
    
    try {
      await fetchQuestions(interviewId);
    } catch (error) {
      console.error("Retry fetch failed:", error);
      
      if (jobTitle) {
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

  if (hasConnectionError && !errorState.hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-slate-50/60 to-blue-50/40" />
        <div className="relative z-10 container py-4 md:py-6 max-w-5xl mx-auto px-3 sm:px-6">
          <InterviewLogo />
          <Card className="p-6 mt-6 text-center bg-white/90 backdrop-blur-sm">
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
      </div>
    );
  }

  if (errorState.hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-slate-50/60 to-blue-50/40" />
        <div className="relative z-10 container py-4 md:py-6 max-w-5xl mx-auto px-3 sm:px-6">
          <InterviewLogo />
          <Card className="p-6 mt-6 text-center bg-white/90 backdrop-blur-sm">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <p className="mb-6">{errorState.message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRetryLoading} variant="outline">Retry Loading</Button>
              <Button onClick={handleStartNewInterview}>Start New Interview</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-background" />

      {/* Full-height centred layout */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-4 md:space-y-6">

          {/* tuterra.ai logo — shown above the card in all states except completion */}
          {!isInterviewComplete && (
            <div className="flex items-center justify-center mb-2">
              <img
                src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png"
                alt="tuterra.ai"
                className="h-10 w-auto object-contain"
              />
            </div>
          )}

          {/* Hero card — setup state only */}
          {!isInterviewInProgress && !isInterviewComplete && !isDetailMode && !isGeneratingQuestions && !loadingQuestions && !isGenerating && (
            <div
              className="relative rounded-2xl border-2 border-[#C8A84B] shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex flex-col sm:flex-row bg-[#F7F3EC] p-4 gap-4"
              style={{ minHeight: '300px' }}
            >
              <div className="flex flex-col justify-between p-4 sm:w-[40%] shrink-0">
                <div>
                  <p className="text-xs font-mono text-[#8a7a5a] mb-4 tracking-wide uppercase">AI-Powered Practice</p>
                  <div className="flex items-start gap-3 mb-4">
                    <BrainCircuit className="h-8 w-8 text-[#7a6a2a] mt-1 shrink-0" />
                    <h1 className="text-3xl md:text-4xl font-medium font-manrope text-[#1a1a1a] leading-tight tracking-tight">Interview Simulator</h1>
                  </div>
                  <p className="text-sm text-[#5a5040] leading-relaxed">
                    Practice real interview questions with AI feedback tailored to your target role and industry.
                  </p>
                </div>
                <div className="mt-8">
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-black/80 bg-white/30 backdrop-blur-md border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] font-semibold text-sm">
                    <Plus className="h-4 w-4" />
                    Set up below to start
                  </div>
                </div>
              </div>
              <div
                className="flex-1 rounded-xl bg-cover bg-center min-h-[180px] sm:min-h-0"
                style={{ backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/jobinterviewsimulator.jpg')" }}
              />
            </div>
          )}

          <InterviewDebug sessionCreationErrors={sessionCreationErrors} />

          {!interviewReady && !isInterviewInProgress && !isInterviewComplete && (isGeneratingQuestions || loadingQuestions || isGenerating) && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-[#C8A84B]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#C8A84B] border-l-transparent border-r-transparent border-b-transparent animate-spin" />
              </div>
              <p className="text-base font-medium text-[#3a3530]">Preparing your interview questions…</p>
              <p className="text-sm text-[#8a7a5a]">This may take a moment as we analyse the job requirements.</p>
            </div>
          )}

          {!interviewReady && !isInterviewInProgress && !isInterviewComplete &&
           !isGeneratingQuestions && !loadingQuestions && !isGenerating && !isDetailMode && (
            <MultiStepInterviewForm
              onComplete={handleFormSubmit}
              isLoading={isGeneratingQuestions || loadingQuestions || isGenerating}
              progress={progress}
              initialTopic={quickStartTopic}
              skipIndustry={shouldSkipIndustry}
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
              jobTitle={jobTitle}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
            />
          )}

          {isInterviewComplete && !showFeedback && (
            <InterviewCompletion
              transcript={transcript}
              onDownloadTranscript={handleDownloadTranscript}
              onStartNew={handleStartNewInterview}
              onViewFeedback={handleViewFeedback}
              sessionId={currentSessionId}
            />
          )}

          {isInterviewComplete && showFeedback && (
            <InterviewFeedbackComponent
              feedback={feedback}
              transcript={transcript}
              onDownloadTranscript={handleDownloadTranscript}
              onStartNew={handleStartNewInterview}
              loading={isGeneratingFeedback}
              hasError={feedbackError}
              onRetry={handleRetryFeedback}
            />
          )}

        </div>
      </div>

      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        featureType="interview"
      />
    </>
  );
};

export default JobInterviewSimulator;
