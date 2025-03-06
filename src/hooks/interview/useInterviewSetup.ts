
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "@/lib/uuid";
import { InterviewQuestion } from "@/types/interview";
import { useInterviewQuestions } from "./useInterviewQuestions";
import { supabase } from "@/integrations/supabase/client";

export const useInterviewSetup = (
  setCurrentSessionId: (id: string) => void,
  setQuestions: (questions: InterviewQuestion[]) => void,
  setIsGeneratingQuestions: (isGenerating: boolean) => void
) => {
  const { toast } = useToast();
  const { generateQuestions, loading: questionsLoading } = useInterviewQuestions();
  
  const [interviewReady, setInterviewReady] = useState(false);
  const [sessionCreationErrors, setSessionCreationErrors] = useState<string[]>([]);
  const [usedFallbackQuestions, setUsedFallbackQuestions] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [persistenceLoading, setPersistenceLoading] = useState(false);
  
  // Monitor online status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
  
  // Create a session in the database
  const createSession = async (industry: string, jobRole: string, jobDescription: string) => {
    setPersistenceLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          job_title: jobRole,
          industry: industry,
          job_description: jobDescription,
          status: 'created'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    } finally {
      setPersistenceLoading(false);
    }
  };
  
  // Helper function for fallback mode
  const handleFallbackMode = async (jobRole: string, industry: string) => {
    console.log("Using fallback interview mode...");
    // Generate a fallback session ID
    const sessionId = uuidv4();
    setCurrentSessionId(sessionId);
    
    // Generate fallback questions locally
    const fallbackQuestions = DEFAULT_QUESTIONS.map((question, index) => ({
      id: `fallback-${index}`,
      sessionId: sessionId,
      question: question,
      questionOrder: index,
      createdAt: new Date().toISOString()
    }));
    
    setQuestions(fallbackQuestions);
    setUsedFallbackQuestions(true);
    setInterviewReady(true);
  };
  
  const handleStartInterview = async (industry: string, jobRole: string, jobDescription: string) => {
    console.log("Starting interview setup with:", { industry, jobRole, jobDescription: jobDescription?.substring(0, 50) + '...' });
    setIsGeneratingQuestions(true);
    setSessionCreationErrors([]);
    setUsedFallbackQuestions(false);
    
    // Validate inputs
    if (!industry?.trim() || !jobRole?.trim()) {
      console.error("Invalid inputs:", { industry, jobRole });
      setSessionCreationErrors(["Industry and job role are required"]);
      await handleFallbackMode(jobRole || "Unknown Role", industry || "General");
      setIsGeneratingQuestions(false);
      return;
    }
    
    // If we're offline, immediately go to fallback mode
    if (!isOnline) {
      console.log("Device is offline. Using fallback interview mode...");
      await handleFallbackMode(jobRole, industry);
      
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
      
      // Add a small delay to ensure session is created in database before generating questions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Generate interview questions
      try {
        console.log("Generating questions for session with ID:", sessionId);
        const questions = await generateQuestions(sessionId, jobRole, industry, jobDescription);
        setQuestions(questions);
        setInterviewReady(true);
      } catch (questionError) {
        console.error("Error generating questions:", questionError);
        
        // Use fallback questions instead
        console.log("Using fallback questions due to error");
        await handleFallbackMode(jobRole, industry);
        
        setSessionCreationErrors(prev => [
          ...prev, 
          `Question generation failed: ${questionError instanceof Error ? questionError.message : 'Unknown error'}`
        ]);
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      
      // Set up generic interview with fallback questions
      await handleFallbackMode(jobRole, industry);
      
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

// Default fallback questions
const DEFAULT_QUESTIONS = [
  "Tell me about yourself and your background.",
  "What are your greatest professional strengths?",
  "What do you consider to be your weaknesses?",
  "Why are you interested in this position?",
  "Where do you see yourself in 5 years?",
  "Describe a challenging situation at work and how you handled it.",
  "Why should we hire you?",
  "What are your salary expectations?",
  "Do you have any questions for us?"
];
