
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInterviewPersistence } from "./useInterviewPersistence";
import { useInterviewQuestions } from "./useInterviewQuestions";
import { InterviewQuestion } from "@/types/interview";

export const useInterviewSetup = (
  setCurrentSessionId: (id: string) => void,
  setQuestions: (questions: InterviewQuestion[]) => void,
  setIsGeneratingQuestions: (isGenerating: boolean) => void
) => {
  const { toast } = useToast();
  const { createSession, loading: persistenceLoading } = useInterviewPersistence();
  const { generateQuestions, loading: questionsLoading } = useInterviewQuestions(null, setQuestions);
  
  const [interviewReady, setInterviewReady] = useState(false);
  const [sessionCreationErrors, setSessionCreationErrors] = useState<string[]>([]);
  
  const handleStartInterview = async (industry: string, jobRole: string, jobDescription: string) => {
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

  return {
    handleStartInterview,
    interviewReady,
    setInterviewReady,
    sessionCreationErrors,
    isLoading: persistenceLoading || questionsLoading
  };
};
