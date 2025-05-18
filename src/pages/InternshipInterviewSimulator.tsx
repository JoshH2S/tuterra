import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useInterviewQuestions } from "@/hooks/interview/useInterviewQuestions";
import { useInterviewState } from "@/hooks/interview/useInterviewState";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewReadyPrompt } from "@/components/interview/InterviewReadyPrompt";
import { FullPageLoader } from "@/components/ui/loading-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { InterviewQuestion, InterviewTranscript } from "@/types/interview";

interface InternshipSession {
  id: string;
  user_id: string;
  job_title: string;
  industry: string;
  job_description: string | null;
  current_phase: number;
}

// Helper function to format industry name properly
const formatIndustryName = (industry: string): string => {
  if (!industry) return '';
  
  // Replace underscores with spaces and capitalize each word
  return industry
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const InternshipInterviewSimulator = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const shouldAutoStart = searchParams.get('start') === 'true';
  const questionsVerified = searchParams.get('questionsVerified') === 'true';
  
  // Add all missing state variables
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [questionsLoaded, setQuestionsLoaded] = useState<boolean>(false);
  const [questionsFetched, setQuestionsFetched] = useState<boolean>(false);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [defaultQuestionsState, setDefaultQuestionsState] = useState<{
    used: boolean;
    reason: string | null;
  }>({ used: false, reason: null });
  const [isSavingProgress, setIsSavingProgress] = useState<boolean>(false);
  const [isFeedbackGenerating, setIsFeedbackGenerating] = useState<boolean>(false);
  
  // Use state instead of refs for better component lifecycle handling
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [autoStartAttempted, setAutoStartAttempted] = useState(false);
  const [autoStartTimer, setAutoStartTimer] = useState<number | null>(null);
  
  const [session, setSession] = useState<InternshipSession | null>(null);
  const [formattedIndustry, setFormattedIndustry] = useState<string>('');
  
  // Import interview state management from the shared hook
  const interviewState = useInterviewState();
  
  const {
    questions,
    setQuestions,
    responses,
    setResponses,
    currentQuestionIndex,
    isInterviewInProgress,
    isInterviewComplete,
    typingEffect,
    setTypingEffect,
    clearTypingTimer,
    transcript,
    updateTranscript,
    startInterview,
    getCurrentQuestion,
    nextQuestion
  } = interviewState;

  // Use existing question hooks but don't attempt to generate here
  const { fetchQuestions, loading: loadingQuestions } = useInterviewQuestions(sessionId || null, setQuestions);

  // Ref to textarea for auto-focus
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (initialLoadComplete) {
        console.log("Initial load already completed, skipping");
        return;
      }

      try {
        if (!sessionId) {
          setErrorMessage("No session ID provided");
          setIsLoading(false);
          setInitialLoadComplete(true);
          return;
        }
        
        console.log("InternshipInterviewSimulator: Fetching session data for", sessionId);
        
        // Fetch the internship session
        const { data: sessionData, error: sessionError } = await supabase
          .from('internship_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
          
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          throw sessionError;
        }
        
        if (!sessionData) {
          console.error("Session not found");
          throw new Error("Session not found");
        }
        
        console.log("InternshipInterviewSimulator: Session data retrieved:", sessionData);
        setSession(sessionData);
        
        // Format industry name properly
        if (sessionData.industry) {
          setFormattedIndustry(formatIndustryName(sessionData.industry));
        }
        
        // Try to fetch existing questions for this session
        try {
          await loadQuestions(questionsVerified);
        } catch (error) {
          console.error("Error in initial question loading:", error);
          setQuestionsError("We couldn't load your interview questions. Using default questions instead.");
          createAndUseDefaultQuestions(sessionData);
        }
      } catch (error) {
        console.error("Error loading session:", error);
        setErrorMessage("Failed to load internship session. Please try again.");
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };
    
    fetchSessionData();
  }, [sessionId, questionsVerified]);

  // Function to load questions with retry logic
  const loadQuestions = async (skipRetries = false) => {
    if (!sessionId || !fetchQuestions) return;
    
    console.log("InternshipInterviewSimulator: Fetching questions for session", sessionId);
    
    try {
      setQuestionsFetched(true);
      const questionsList = await fetchQuestions();
      
      // Check if questionsList exists and has items
      if (!questionsList || questionsList.length === 0) {
        console.warn("No questions found for this session");
        
        if (session && !skipRetries && retryAttempt < 2) {
          console.log(`Retry attempt ${retryAttempt + 1}/2 for fetching questions`);
          setRetryAttempt(prev => prev + 1);
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1500));
          return loadQuestions(skipRetries);
        }
        
        // If retries exhausted or skipped, use default questions
        setQuestionsError("No questions found. Using default questions instead.");
        if (session) {
          createAndUseDefaultQuestions(session);
        }
      } else {
        console.log(`Successfully loaded ${questionsList.length} questions:`, 
          questionsList.map(q => ({ id: q.id.slice(0, 8) + '...', question: q.question.substring(0, 30) + '...' })));
        setQuestions(questionsList);
        setQuestionsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestionsError("We couldn't load your interview questions. Using default questions instead.");
      
      if (session) {
        createAndUseDefaultQuestions(session);
      }
    }
  };
  
  // Create default questions if none were loaded
  const createAndUseDefaultQuestions = (sessionData: InternshipSession) => {
    console.log("Using default questions for session", sessionId);
    
    const defaultQuestions: InterviewQuestion[] = [
      {
        id: `default-q-1-${sessionId}-${Date.now()}`,
        session_id: sessionId || '',
        question: `Tell me about your experience and skills relevant to this ${sessionData.job_title} position.`,
        question_order: 0,
        created_at: new Date().toISOString()
      },
      {
        id: `default-q-2-${sessionId}-${Date.now()}`,
        session_id: sessionId || '',
        question: `What interests you about working in the ${sessionData.industry} industry?`,
        question_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: `default-q-3-${sessionId}-${Date.now()}`,
        session_id: sessionId || '',
        question: "Describe a challenging situation you've faced professionally and how you handled it.",
        question_order: 2,
        created_at: new Date().toISOString()
      }
    ];
    
    setQuestions(defaultQuestions);
    setQuestionsLoaded(true);
    setDefaultQuestionsState({ 
      used: true, 
      reason: "Could not find or load generated questions" 
    });
  };
  
  // Effect for typing effect timer - use our clearTypingTimer to avoid duplicated logic
  useEffect(() => {
    if (typingEffect && isInterviewInProgress) {
      // Set a fixed typing effect duration - 2 seconds for simplicity
      const typingSpeed = 2000;
      
      console.log(`InternshipInterviewSimulator: Setting typing effect timer for ${typingSpeed}ms`);
      
      // Clear any existing timer first
      clearTypingTimer();
      
      const timer = window.setTimeout(() => {
        console.log("InternshipInterviewSimulator: Typing effect timer completed, disabling typing effect");
        setTypingEffect(false);
      }, typingSpeed);
      
      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [typingEffect, isInterviewInProgress, setTypingEffect, clearTypingTimer]);
  
  // Auto-start effect with better dependency handling
  useEffect(() => {
    // Clear any existing auto-start timer to prevent multiple timers
    if (autoStartTimer !== null) {
      clearTimeout(autoStartTimer);
    }
    
    // Only attempt to auto-start if conditions are right
    if (
      shouldAutoStart &&
      initialLoadComplete &&
      !isLoading &&
      !loadingQuestions &&
      questions.length > 0 &&
      !isInterviewInProgress &&
      !isInterviewComplete &&
      !autoStartAttempted
    ) {
      console.log("Setting up auto-start timer with", questions.length, "questions available");
      
      // Use a timer for auto-start to ensure UI is ready
      const timer = window.setTimeout(() => {
        console.log("Auto-starting interview");
        setAutoStartAttempted(true);
        startInterview();
      }, 800); // Slightly longer delay to ensure everything is rendered
      
      setAutoStartTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [
    shouldAutoStart,
    initialLoadComplete,
    isLoading,
    loadingQuestions,
    questions,
    isInterviewInProgress,
    isInterviewComplete,
    autoStartAttempted,
    startInterview
  ]);

  // Clean up auto-start timer on unmount
  useEffect(() => {
    return () => {
      if (autoStartTimer !== null) {
        clearTimeout(autoStartTimer);
      }
    };
  }, [autoStartTimer]);

  // Function to generate feedback using AI
  const generateFeedback = async (transcript: InterviewTranscript[]): Promise<string> => {
    if (!session) return "";
    
    try {
      console.log("InternshipInterviewSimulator: Generating feedback for", sessionId);
      const { data, error } = await supabase.functions.invoke('generate-interview-feedback', {
        body: { 
          transcript,
          jobTitle: session.job_title,
          industry: session.industry,
          isInternship: true
        }
      });

      if (error) throw error;
      
      return data?.feedback?.overall_feedback || "";
    } catch (error) {
      console.error("Error generating feedback:", error);
      return "We were unable to generate specific feedback, but your interview responses have been saved.";
    }
  };

  // Save interview progress and proceed to next phase
  const saveProgressAndAdvance = async () => {
    if (!session || !sessionId) return;
    
    setIsSavingProgress(true);
    setIsFeedbackGenerating(true);
    
    try {
      // Make sure the transcript is up to date
      updateTranscript();
      
      console.log("InternshipInterviewSimulator: Saving progress and generating feedback");
      
      // Generate feedback using AI
      const feedback = await generateFeedback(transcript);
      
      // Save responses and feedback to internship_progress
      const { error: progressError } = await supabase
        .from('internship_progress')
        .insert({
          user_id: session.user_id,
          session_id: sessionId,
          phase_number: 1,
          user_responses: transcript.map(t => ({ question: t.question, answer: t.answer })),
          ai_feedback: feedback,
        });
      
      if (progressError) throw progressError;
      
      // Update the session's current phase
      const { error: updateError } = await supabase
        .from('internship_sessions')
        .update({ current_phase: 2 })
        .eq('id', sessionId);
      
      if (updateError) throw updateError;
      
      console.log("InternshipInterviewSimulator: Progress saved, navigating to phase 2");
      
      // Redirect to phase 2
      navigate(`/internship/phase-2/${sessionId}`);
      
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProgress(false);
      setIsFeedbackGenerating(false);
    }
  };

  // Handle interview completion
  useEffect(() => {
    if (isInterviewComplete) {
      void saveProgressAndAdvance();
    }
  }, [isInterviewComplete]);

  // Create custom handlers for this specific implementation
  const handleStartChat = () => {
    console.log("Manually starting interview");
    startInterview();
  };

  const handleSubmitResponse = async (response: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Update responses
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));
    
    // Move to next question
    nextQuestion();
  };

  const handleReturnToInvite = () => {
    if (sessionId) {
      navigate(`/internship/interview/invite/${sessionId}`);
    } else {
      navigate('/internship/start');
    }
  };

  const handleTypingComplete = () => {
    console.log("InternshipInterviewSimulator: Handling typing complete callback");
    setTypingEffect(false);
  };

  // Handle retry loading questions
  const handleRetryLoadQuestions = async () => {
    setQuestionsError(null);
    setQuestionsLoaded(false);
    setDefaultQuestionsState({ used: false, reason: null });
    setRetryAttempt(0);
    
    try {
      await loadQuestions(false);
      
      toast({
        title: "Success",
        description: "Questions loaded successfully",
      });
    } catch (error) {
      console.error("Error retrying question load:", error);
      toast({
        title: "Error",
        description: "Failed to load questions. Using default questions instead.",
        variant: "warning",
      });
    }
  };

  const currentQuestion = getCurrentQuestion();
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Show loading state
  if (isLoading || loadingQuestions) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <FullPageLoader />
      </div>
    );
  }

  // Show error state
  if (errorMessage) {
    return (
      <div className="container py-8 max-w-4xl mx-auto px-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{errorMessage}</p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/internship/start')}>
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container pt-4 pb-16 max-w-4xl mx-auto px-4">
      <div className="space-y-8">
        {isSavingProgress && (
          <Card className="text-center p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-lg">
                {isFeedbackGenerating 
                  ? "Generating feedback on your interview performance..." 
                  : "Saving your interview progress..."}
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a moment to process.
              </p>
            </div>
          </Card>
        )}
        
        {!isSavingProgress && session && (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold">{session.job_title} Interview</h1>
              {/* Display the properly formatted industry name */}
              <p className="text-muted-foreground">{formattedIndustry || session.industry} Industry</p>
              
              {defaultQuestionsState.used && (
                <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <p className="text-sm text-amber-500">
                    Using default questions. {defaultQuestionsState.reason}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={handleRetryLoadQuestions}
                  >
                    Retry Loading Questions
                  </Button>
                </div>
              )}
              
              {questionsError && !defaultQuestionsState.used && (
                <div className="mt-2">
                  <p className="text-sm text-amber-500">{questionsError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-1 text-xs"
                    onClick={handleRetryLoadQuestions}
                  >
                    Retry Loading Questions
                  </Button>
                </div>
              )}
            </div>
            
            {questions.length > 0 && !isInterviewInProgress && !isInterviewComplete && (
              <InterviewReadyPrompt
                jobTitle={session.job_title}
                onStartChat={handleStartChat}
                usedFallbackQuestions={defaultQuestionsState.used}
              />
            )}
            
            {isInterviewInProgress && (
              <InterviewChat
                currentQuestion={currentQuestion}
                onSubmitResponse={handleSubmitResponse}
                typingEffect={typingEffect}
                onTypingComplete={handleTypingComplete}
                isLastQuestion={isLastQuestion}
                jobTitle={session.job_title}
                inputRef={textareaRef}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InternshipInterviewSimulator;
