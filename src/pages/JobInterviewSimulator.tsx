
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
    
    try {
      // Create a new interview session
      const sessionId = await createSession(industry, jobRole, jobDescription);
      
      if (!sessionId) {
        throw new Error("Failed to create interview session");
      }
      
      setCurrentSessionId(sessionId);
      
      // Generate interview questions
      await generateQuestions(industry, jobRole, jobDescription);
      
      setInterviewReady(true);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        title: "Error",
        description: "Failed to start the interview. Please try again.",
        variant: "destructive",
      });
    } finally {
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
  };

  const currentQuestion = getCurrentQuestion();
  const isLoading = questionsLoading || responsesLoading || persistenceLoading || feedbackLoading;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="container py-6 max-w-5xl mx-auto">
      <div className="space-y-8">
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
