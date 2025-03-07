import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInterviewPersistence } from "./useInterviewPersistence";
import { useInterviewQuestions } from "./useInterviewQuestions";
import { useNetworkStatus } from "./useNetworkStatus";
import { useFallbackMode } from "./useFallbackMode";
import { verifySession } from "./utils/sessionVerification";
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
  
  const { isOnline } = useNetworkStatus();
  const { handleFallbackMode, usedFallbackQuestions } = useFallbackMode(
    setCurrentSessionId, 
    setQuestions,
    generateFallbackQuestions
  );
  
  const handleStartInterview = async (industry: string, jobRole: string, jobDescription: string) => {
    console.log("Starting interview setup with:", { industry, jobRole, jobDescription: jobDescription?.substring(0, 50) + '...' });
    setIsGeneratingQuestions(true);
    setSessionCreationErrors([]);
    
    // Validate inputs
    if (!industry?.trim()) {
      console.error("Invalid industry:", industry);
      setSessionCreationErrors(["Industry is required"]);
      await handleFallbackMode(jobRole || "Unknown Role", "General");
      setInterviewReady(true);
      setIsGeneratingQuestions(false);
      return;
    }
    
    if (!jobRole?.trim()) {
      console.error("Invalid job role:", jobRole);
      setSessionCreationErrors(["Job role is required"]);
      await handleFallbackMode("Unknown Role", industry || "General");
      setInterviewReady(true);
      setIsGeneratingQuestions(false);
      return;
    }
    
    // Check if offline and use fallback if needed
    if (!isOnline) {
      console.log("Device is offline. Using fallback interview mode...");
      await handleFallbackMode(jobRole, industry);
      
      setSessionCreationErrors([
        "You appear to be offline. Using local interview mode with standard questions."
      ]);
      
      setInterviewReady(true);
      setIsGeneratingQuestions(false);
      return;
    }
    
    try {
      // Create session
      const sessionId = await createSession(industry, jobRole, jobDescription);
      
      if (!sessionId) {
        const errMsg = "Failed to create session: No session ID returned";
        setSessionCreationErrors(prev => [...prev, errMsg]);
        throw new Error(errMsg);
      }
      
      console.log("Session created successfully with ID:", sessionId);
      setCurrentSessionId(sessionId);
      
      // Verify session exists in database
      const isVerified = await verifySession(sessionId);
      
      if (!isVerified) {
        console.error("Failed to verify session after multiple attempts:", sessionId);
        throw new Error("Session verification failed after multiple attempts");
      }
      
      // Generate questions for the verified session
      try {
        console.log("Session verified. Generating questions for session with ID:", sessionId);
        await generateQuestions(industry, jobRole, jobDescription, sessionId);
        setInterviewReady(true);
      } catch (questionError) {
        console.error("Error generating questions:", questionError);
        
        console.log("Using fallback questions due to error");
        await handleFallbackMode(jobRole, industry);
        setInterviewReady(true);
        
        setSessionCreationErrors(prev => [
          ...prev, 
          `Question generation failed: ${questionError instanceof Error ? questionError.message : 'Unknown error'}`
        ]);
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      
      await handleFallbackMode(jobRole, industry);
      setInterviewReady(true);
      
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
