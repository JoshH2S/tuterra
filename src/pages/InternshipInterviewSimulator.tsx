
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  
  const [session, setSession] = useState<InternshipSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isFeedbackGenerating, setIsFeedbackGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  
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
    transcript,
    updateTranscript,
    startInterview,
    getCurrentQuestion,
    nextQuestion
  } = interviewState;

  // Use existing question hooks but don't attempt to generate here
  const { fetchQuestions, loading: loadingQuestions } = useInterviewQuestions(sessionId || null, setQuestions);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        if (!sessionId) {
          setErrorMessage("No session ID provided");
          setIsLoading(false);
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
            console.warn("No questions found for this session, redirecting to invitation page");
            setQuestionsError("We couldn't load your interview questions. Redirecting to preparation page...");
            setTimeout(() => {
              navigate(`/internship/interview/invite/${sessionId}`);
            }, 3000);
          }
        } catch (error) {
          console.error("Error fetching questions:", error);
          setQuestionsError("We couldn't load your interview questions. Please return to the invitation page and regenerate them.");
        }
      } catch (error) {
        console.error("Error loading session:", error);
        setErrorMessage("Failed to load internship session. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessionId, fetchQuestions, navigate]);

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
      <div className="container py-8 max-w-4xl mx-auto">
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
  
  // Show error if questions couldn't be loaded
  if (questionsError && questions.length === 0) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-amber-500">Questions Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{questionsError}</p>
            <div className="flex justify-center">
              <Button onClick={handleReturnToInvite}>
                Return to Invitation Page
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
            </div>
            
            {questions.length > 0 && !isInterviewInProgress && !isInterviewComplete && (
              <InterviewReadyPrompt
                jobTitle={session.job_title}
                onStartChat={handleStartChat}
                usedFallbackQuestions={false}
              />
            )}
            
            {isInterviewInProgress && (
              <InterviewChat
                currentQuestion={currentQuestion}
                onSubmitResponse={handleSubmitResponse}
                typingEffect={typingEffect}
                onTypingComplete={() => {}}
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
