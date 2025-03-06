
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInterviewPersistence } from "./useInterviewPersistence";
import { useInterviewQuestions } from "./useInterviewQuestions";
import { InterviewQuestion } from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";

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
  
  // Helper function for fallback mode
  const handleFallbackMode = (jobRole: string, industry: string) => {
    console.log("Using fallback interview mode...");
    // Generate a fallback session ID
    const sessionId = uuidv4();
    setCurrentSessionId(sessionId);
    
    // Generate fallback questions
    const fallbackQuestions = generateFallbackQuestions(jobRole, industry);
    setQuestions(fallbackQuestions);
    setUsedFallbackQuestions(true);
    setInterviewReady(true);
  };
  
  const handleStartInterview = async (industry: string, jobRole: string, jobDescription: string) => {
    console.log("Starting interview setup...");
    setIsGeneratingQuestions(true);
    setSessionCreationErrors([]);
    setUsedFallbackQuestions(false);
    
    // If we're offline, immediately go to fallback mode
    if (!isOnline) {
      console.log("Device is offline. Using fallback interview mode...");
      handleFallbackMode(jobRole, industry);
      
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
      
      // Step 2: Generate interview questions - directly after session creation, no setTimeout
      try {
        console.log("Generating questions for session with ID:", sessionId);
        await generateQuestions(industry, jobRole, jobDescription, sessionId);
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
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      
      // Set up generic interview with fallback questions
      handleFallbackMode(jobRole, industry);
      
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
    } finally {
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
