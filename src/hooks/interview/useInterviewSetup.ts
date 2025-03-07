import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInterviewPersistence } from "./useInterviewPersistence";
import { useInterviewQuestions } from "./useInterviewQuestions";
import { InterviewQuestion } from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";
import { JOB_ROLE_OPTIONS } from "@/components/interview/constants";

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
  
  const verifySession = async (sessionId: string, maxRetries = 3, delayMs = 1000): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Verifying session attempt ${attempt}/${maxRetries}...`);
      
      try {
        const { data, error } = await supabase
          .from('interview_sessions')
          .select('id, session_id')
          .eq('session_id', sessionId)
          .maybeSingle();
        
        if (error) {
          console.error(`Verification attempt ${attempt} failed:`, error);
        } else if (data) {
          console.log('Session verified successfully:', data);
          return true;
        } else {
          console.log(`Session not found on attempt ${attempt}`);
        }
        
        if (attempt < maxRetries) {
          const backoffDelay = delayMs * Math.pow(1.5, attempt - 1);
          console.log(`Waiting ${backoffDelay}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      } catch (error) {
        console.error(`Verification attempt ${attempt} threw error:`, error);
      }
    }
    
    return false;
  };
  
  const handleFallbackMode = (jobRole: string, industry: string) => {
    console.log("Using fallback interview mode...");
    const sessionId = uuidv4();
    setCurrentSessionId(sessionId);
    
    const fallbackQuestions = generateFallbackQuestions(jobRole, industry);
    setQuestions(fallbackQuestions);
    setUsedFallbackQuestions(true);
    setInterviewReady(true);
  };
  
  const handleStartInterview = async (industry: string, jobRole: string, jobDescription: string) => {
    console.log("Starting interview setup with:", { industry, jobRole, jobDescription: jobDescription?.substring(0, 50) + '...' });
    setIsGeneratingQuestions(true);
    setSessionCreationErrors([]);
    setUsedFallbackQuestions(false);
    
    if (!industry?.trim() || !jobRole?.trim()) {
      console.error("Invalid inputs:", { industry, jobRole });
      setSessionCreationErrors(["Industry and job role are required"]);
      handleFallbackMode(jobRole || "Unknown Role", industry || "General");
      setIsGeneratingQuestions(false);
      return;
    }
    
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
      const sessionId = await createSession(industry, jobRole, jobDescription);
      
      if (!sessionId) {
        const errMsg = "Failed to create session: No session ID returned";
        setSessionCreationErrors(prev => [...prev, errMsg]);
        throw new Error(errMsg);
      }
      
      console.log("Session created successfully with ID:", sessionId);
      setCurrentSessionId(sessionId);
      
      const isVerified = await verifySession(sessionId);
      
      if (!isVerified) {
        console.error("Failed to verify session after multiple attempts:", sessionId);
        throw new Error("Session verification failed after multiple attempts");
      }
      
      try {
        console.log("Session verified. Generating questions for session with ID:", sessionId);
        await generateQuestions(industry, jobRole, jobDescription, sessionId);
        setInterviewReady(true);
      } catch (questionError) {
        console.error("Error generating questions:", questionError);
        
        console.log("Using fallback questions due to error");
        const fallbackQuestions = generateFallbackQuestions(jobRole, industry);
        setQuestions(fallbackQuestions);
        setUsedFallbackQuestions(true);
        setInterviewReady(true);
        
        setSessionCreationErrors(prev => [
          ...prev, 
          `Question generation failed: ${questionError instanceof Error ? questionError.message : 'Unknown error'}`
        ]);
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      
      handleFallbackMode(jobRole, industry);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isConnectionError = errorMessage.includes('network') || 
                               errorMessage.includes('connect') || 
                               errorMessage.includes('timeout');
      
      setSessionCreationErrors(prev => [
        ...prev, 
        isConnectionError 
          ? `We're having trouble connecting to our services. Using offline mode with standard questions.`
          : `Error setting up interview: ${errorMessage}`
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
