
import { useEffect, useState } from "react";
import { 
  useInterviewState,
  useInterviewQuestions, 
  useInterviewResponses,
  useInterviewFeedback,
  useInterviewPersistence 
} from "@/hooks/interview";
import { InterviewForm } from "@/components/interview/InterviewForm";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { InterviewFeedbackComponent } from "@/components/interview/InterviewFeedback";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
    responses,
    setResponses,
    currentQuestionIndex,
    isGeneratingQuestions,
    setIsGeneratingQuestions,
    isInterviewInProgress,
    isInterviewComplete,
    transcript,
    setTranscript,
    typingEffect,
    setTypingEffect,
    resetInterview,
    startInterview,
    completeInterview,
    nextQuestion,
    updateTranscript,
    getCurrentQuestion
  } = useInterviewState();

  const { toast } = useToast();
  const { createSession, downloadTranscript, loading: persistenceLoading } = useInterviewPersistence();
  const { generateQuestions, loading: questionsLoading } = useInterviewQuestions(currentSessionId, setQuestions);
  const { saveResponse, loading: responsesLoading } = useInterviewResponses(setResponses);
  const { generateFeedback, feedback, loading: feedbackLoading } = useInterviewFeedback(currentSessionId);

  const [interviewReady, setInterviewReady] = useState(false);
  const [sessionCreationErrors, setSessionCreationErrors] = useState<string[]>([]);

  // When typing effect finishes
  useEffect(() => {
    let typingTimer: number;
    if (typingEffect && isInterviewInProgress) {
      typingTimer = window.setTimeout(() => {
        setTypingEffect(false);
      }, 2000); // Adjust typing speed here
    }
    return () => clearTimeout(typingTimer);
  }, [typingEffect, isInterviewInProgress, setTypingEffect]);

  // Generate transcript when interview is completed
  useEffect(() => {
    if (isInterviewComplete && Object.keys(responses).length > 0) {
      updateTranscript();
    }
  }, [isInterviewComplete, responses, updateTranscript]);

  // Generate feedback when transcript is ready
  useEffect(() => {
    if (isInterviewComplete && transcript.length > 0 && !feedback) {
      generateFeedback(transcript);
    }
  }, [isInterviewComplete, transcript, feedback, generateFeedback]);

  const handleStartInterview = async (industry: string, jobRole: string, jobDescription: string) => {
    setIndustry(industry);
    setJobRole(jobRole);
    setJobDescription(jobDescription);
    setIsGeneratingQuestions(true);
    setSessionCreationErrors([]);
    
    try {
      // Step 1: Create a new interview session
      console.log("Creating new interview session...");
      const sessionId = await createSession(industry, jobRole, jobDescription);
      
      if (!sessionId) {
        const errMsg = "Failed to create session: No session ID returned";
        console.error(errMsg);
        setSessionCreationErrors(prev => [...prev, errMsg]);
        throw new Error(errMsg);
      }
      
      console.log("Session created successfully with ID:", sessionId);
      setCurrentSessionId(sessionId);
      
      // Wait for the session ID to be set before generating questions
      // Wait a moment for the state to update
      setTimeout(async () => {
        // Double check the session ID is actually set
        if (!sessionId) {
          const errMsg = "Session ID not available after delay";
          console.error(errMsg);
          setSessionCreationErrors(prev => [...prev, errMsg]);
          setIsGeneratingQuestions(false);
          return;
        }
          
        try {
          // Step 2: Generate interview questions
          console.log("Generating questions for session with ID:", sessionId);
          await generateQuestions(industry, jobRole, jobDescription);
          setInterviewReady(true);
        } catch (questionError) {
          console.error("Error generating questions:", questionError);
          setSessionCreationErrors(prev => [...prev, `Error generating questions: ${questionError.message || 'Unknown error'}`]);
          toast({
            title: "Error",
            description: "Failed to generate interview questions. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGeneratingQuestions(false);
        }
      }, 1000); // Increased delay to ensure state is properly updated
    } catch (error) {
      console.error("Error starting interview:", error);
      setSessionCreationErrors(prev => [...prev, `Error starting interview: ${error.message || 'Unknown error'}`]);
      toast({
        title: "Error",
        description: "Failed to start the interview. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingQuestions(false);
    }
  };

  const handleStartChat = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions generated",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
      return;
    }
    
    startInterview();
  };

  const handleSubmitResponse = async (response: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    await saveResponse(currentQuestion, response);
    nextQuestion();
  };

  const handleDownloadTranscript = (format: 'txt' | 'pdf') => {
    downloadTranscript(transcript, jobRole, format);
  };

  const handleStartNew = () => {
    resetInterview();
    setInterviewReady(false);
    setSessionCreationErrors([]);
  };

  // Debug display for development purposes
  const renderDebugInfo = () => {
    if (sessionCreationErrors.length === 0) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
        <h3 className="text-red-700 font-medium">Debug Information</h3>
        <ul className="text-sm text-red-600 mt-2 space-y-1">
          {sessionCreationErrors.map((err, i) => (
            <li key={i}>• {err}</li>
          ))}
        </ul>
        <p className="text-xs text-red-500 mt-2">
          Please try again or refresh the page. If the problem persists, contact support.
        </p>
      </div>
    );
  };

  const currentQuestion = getCurrentQuestion();
  const isLoading = questionsLoading || responsesLoading || persistenceLoading || feedbackLoading;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="space-y-8">
        {renderDebugInfo()}
        
        {!interviewReady && !isInterviewInProgress && !isInterviewComplete && (
          <InterviewForm 
            onSubmit={handleStartInterview} 
            isLoading={isGeneratingQuestions || isLoading}
          />
        )}
        
        {interviewReady && !isInterviewInProgress && !isInterviewComplete && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Your Interview is Ready!</h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              We've prepared a custom interview for the {jobRole} position you're applying for.
              You'll be asked a series of questions - take your time to think and respond naturally.
            </p>
            <Button onClick={handleStartChat} size="lg">
              Begin Interview
            </Button>
          </div>
        )}
        
        {isInterviewInProgress && (
          <InterviewChat
            currentQuestion={currentQuestion}
            onSubmitResponse={handleSubmitResponse}
            typingEffect={typingEffect}
            onTypingComplete={() => setTypingEffect(false)}
            isLastQuestion={isLastQuestion}
          />
        )}
        
        {isInterviewComplete && (
          <InterviewFeedbackComponent
            feedback={feedback}
            transcript={transcript}
            onDownloadTranscript={handleDownloadTranscript}
            onStartNew={handleStartNew}
            loading={feedbackLoading}
          />
        )}
      </div>
    </div>
  );
};

export default JobInterviewSimulator;
