
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

const InternshipInterviewSimulator = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const shouldAutoStart = searchParams.get('start') === 'true';
  const autoStartAttempted = useRef(false);
  const initialLoadComplete = useRef(false);
  
  const [session, setSession] = useState<InternshipSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isFeedbackGenerating, setIsFeedbackGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  
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
      if (initialLoadComplete.current) {
        console.log("Initial load already completed, skipping");
        return;
      }

      try {
        if (!sessionId) {
          setErrorMessage("No session ID provided");
          setIsLoading(false);
          initialLoadComplete.current = true;
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
        
        // Try to fetch existing questions for this session - questions should already be generated at this point
        try {
          console.log("InternshipInterviewSimulator: Fetching questions for session", sessionId);
          const questionsList = await fetchQuestions();
          
          // Check if questionsList exists and has items
          if (!questionsList || questionsList.length === 0) {
            console.warn("No questions found for this session, will use default questions");
            // Don't redirect immediately - we'll use default questions instead
            setQuestionsError("No questions found. Using default questions instead.");
            
            // Create simple default questions
            const defaultQuestions: InterviewQuestion[] = [
              {
                id: `default-q-1-${sessionId}`,
                session_id: sessionId,
                question: `Tell me about your experience and skills relevant to this ${sessionData.job_title} position.`,
                question_order: 0,
                created_at: new Date().toISOString()
              },
              {
                id: `default-q-2-${sessionId}`,
                session_id: sessionId,
                question: `What interests you about working in the ${sessionData.industry} industry?`,
                question_order: 1,
                created_at: new Date().toISOString()
              },
              {
                id: `default-q-3-${sessionId}`,
                session_id: sessionId,
                question: "Describe a challenging situation you've faced professionally and how you handled it.",
                question_order: 2,
                created_at: new Date().toISOString()
              }
            ];
            
            // Set these default questions
            setQuestions(defaultQuestions);
            setQuestionsLoaded(true);
          } else {
            console.log("Questions loaded successfully:", questionsList.length);
            setQuestions(questionsList);
            setQuestionsLoaded(true);
          }
        } catch (error) {
          console.error("Error fetching questions:", error);
          setQuestionsError("We couldn't load your interview questions. Using default questions instead.");
          
          // Still provide default questions
          const defaultQuestions: InterviewQuestion[] = [
            {
              id: `default-q-1-${sessionId}`,
              session_id: sessionId,
              question: `Tell me about your experience and skills relevant to this ${sessionData.job_title} position.`,
              question_order: 0,
              created_at: new Date().toISOString()
            },
            {
              id: `default-q-2-${sessionId}`,
              session_id: sessionId,
              question: `What interests you about working in the ${sessionData.industry} industry?`,
              question_order: 1,
              created_at: new Date().toISOString()
            },
            {
              id: `default-q-3-${sessionId}`,
              session_id: sessionId,
              question: "Describe a challenging situation you've faced professionally and how you handled it.",
              question_order: 2,
              created_at: new Date().toISOString()
            }
          ];
          
          setQuestions(defaultQuestions);
          setQuestionsLoaded(true);
        }
      } catch (error) {
        console.error("Error loading session:", error);
        setErrorMessage("Failed to load internship session. Please try again.");
      } finally {
        setIsLoading(false);
        initialLoadComplete.current = true;
      }
    };
    
    fetchSessionData();
  }, [sessionId, fetchQuestions, setQuestions]);
  
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
  
  // Effect to auto-start the interview once questions are loaded
  // Using a separate effect with correct dependencies to prevent loop
  useEffect(() => {
    // Only attempt to auto-start if:
    // 1. Auto-start flag is true
    // 2. Questions are loaded
    // 3. Not already in progress or complete
    // 4. Not currently loading
    // 5. We haven't attempted to auto-start already
    // 6. Initial load is complete
    if (
      shouldAutoStart &&
      questionsLoaded &&
      questions.length > 0 &&
      !isInterviewInProgress &&
      !isInterviewComplete &&
      !isLoading &&
      !loadingQuestions &&
      !autoStartAttempted.current &&
      initialLoadComplete.current
    ) {
      console.log("Auto-starting interview with", questions.length, "questions");
      autoStartAttempted.current = true; // Mark that we've attempted to auto-start
      
      // Small timeout to ensure UI is ready
      const timer = setTimeout(() => {
        startInterview();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [
    shouldAutoStart,
    questionsLoaded,
    questions.length,
    isInterviewInProgress,
    isInterviewComplete,
    isLoading,
    loadingQuestions,
    startInterview
  ]);

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
              <p className="text-muted-foreground">{session.industry} Industry</p>
              {questionsError && (
                <p className="mt-2 text-sm text-amber-500">{questionsError}</p>
              )}
            </div>
            
            {questions.length > 0 && !isInterviewInProgress && !isInterviewComplete && (
              <InterviewReadyPrompt
                jobTitle={session.job_title}
                onStartChat={handleStartChat}
                usedFallbackQuestions={!!questionsError}
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
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InternshipInterviewSimulator;
