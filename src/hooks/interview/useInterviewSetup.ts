
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
  const { generateQuestions, generateFallbackQuestions, loading: questionsLoading } = useInterviewQuestions(null, setQuestions);
  
  const [interviewReady, setInterviewReady] = useState(false);
  const [sessionCreationErrors, setSessionCreationErrors] = useState<string[]>([]);
  const [usedFallbackQuestions, setUsedFallbackQuestions] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleStartInterview = async (industry: string, jobRole: string, jobDescription: string) => {
    setIsGeneratingQuestions(true);
    setSessionCreationErrors([]);
    setUsedFallbackQuestions(false);
    
    // If we're offline, immediately go to fallback mode
    if (!isOnline) {
      console.log("Device is offline. Using fallback interview mode...");
      const sessionId = uuidv4();
      setCurrentSessionId(sessionId);
      
      const fallbackQuestions = generateFallbackQuestions(jobRole, industry);
      setQuestions(fallbackQuestions);
      setUsedFallbackQuestions(true);
      setInterviewReady(true);
      
      setSessionCreationErrors([
        "You appear to be offline. Using local interview mode with standard questions."
      ]);
      
      setIsGeneratingQuestions(false);
      return;
    }
    
    try {
      // Step 1: Create a new interview session
      console.log("Creating new interview session...");
      const sessionId = await createSession(industry, jobRole, jobDescription);
      
      if (!sessionId) {
        const errMsg = "Failed to create session: No session ID returned";
        setSessionCreationErrors(prev => [...prev, errMsg]);
        throw new Error(errMsg);
      }
      
      console.log("Session created successfully with ID:", sessionId);
      setCurrentSessionId(sessionId);
      
      // Wait for the session ID to be set before generating questions
      setTimeout(async () => {
        try {
          // Step 2: Generate interview questions
          console.log("Generating questions for session with ID:", sessionId);
          await generateQuestions(industry, jobRole, jobDescription);
          setInterviewReady(true);
        } catch (questionError) {
          console.error("Error generating questions:", questionError);
          
          // Use fallback questions instead
          console.log("Using fallback questions due to error");
          const fallbackQuestions = generateFallbackQuestions(jobRole, industry);
          setQuestions(fallbackQuestions);
          setUsedFallbackQuestions(true);
          setInterviewReady(true);
          
          setSessionCreationErrors(prev => [
            ...prev, 
            `We couldn't connect to our question generation service, but we've prepared some standard questions instead.`
          ]);
        } finally {
          setIsGeneratingQuestions(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error starting interview:", error);
      
      // Set up generic interview with fallback questions
      const sessionId = uuidv4();
      setCurrentSessionId(sessionId);
      
      const fallbackQuestions = generateFallbackQuestions(jobRole, industry);
      setQuestions(fallbackQuestions);
      setUsedFallbackQuestions(true);
      setInterviewReady(true);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isConnectionError = errorMessage.includes('network') || 
                               errorMessage.includes('connect') || 
                               errorMessage.includes('timeout');
      
      setSessionCreationErrors(prev => [
        ...prev, 
        isConnectionError 
          ? `We're having trouble connecting to our services. Using offline mode with standard questions.`
          : `There was an error setting up the interview. Using standard questions instead.`
      ]);
      
      setIsGeneratingQuestions(false);
    }
  };

  return {
    handleStartInterview,
    interviewReady,
    setInterviewReady,
    sessionCreationErrors,
    usedFallbackQuestions,
    isLoading: persistenceLoading || questionsLoading,
    isOnline
  };
};

// Helper function for fallback mode
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, 
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
