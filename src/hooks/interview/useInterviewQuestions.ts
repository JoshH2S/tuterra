import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { InterviewQuestion, EnhancedInterviewQuestion } from "@/types/interview";
import { generateFallbackQuestions } from "./utils/fallbackQuestions";
import { generateQuestionsFromApi } from "./utils/apiQuestions";
import { fetchQuestionsFromDb } from "./utils/questionFetching";
import { QuestionHookReturn } from "./types/questionTypes";

export const useInterviewQuestions = (
  sessionId: string | null,
  setQuestions: (questions: InterviewQuestion[]) => void
): QuestionHookReturn => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateQuestions = async (industry: string, jobTitle: string, jobDescription: string, sessionId: string): Promise<InterviewQuestion[]> => {
    // Input validation
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      console.error("Cannot generate questions: No valid session ID provided");
      throw new Error("Session ID is missing or invalid");
    }
    
    if (!industry || typeof industry !== 'string') {
      console.error("Cannot generate questions: Invalid industry parameter");
      throw new Error("Industry parameter is missing or invalid");
    }
    
    if (!jobTitle || typeof jobTitle !== 'string') {
      console.error("Cannot generate questions: Invalid job title parameter");
      throw new Error("Job title parameter is missing or invalid");
    }
    
    setLoading(true);
    
    try {
      // For the API, we're using jobRole, not jobTitle
      // This ensures we map from jobTitle (UI term) to jobRole (API term) consistently
      const params = { industry, jobRole: jobTitle, jobDescription, sessionId };
      const formattedQuestions = await generateQuestionsFromApi(params, (error) => {
        console.error("Error in generateQuestionsFromApi:", error);
      });
      
      setQuestions(formattedQuestions);
      toast({
        title: "Questions generated",
        description: "Your interview questions are ready. Let's start the interview!",
      });
      
      return formattedQuestions;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error; // Let the calling code handle this and use fallback questions
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackQuestionsWrapper = async (jobRole: string, industry: string): Promise<InterviewQuestion[]> => {
    try {
      const fallbackQuestions = await generateFallbackQuestions(jobRole, industry, sessionId);
      return fallbackQuestions;
    } catch (error) {
      console.error("Error generating fallback questions:", error);
      // Return a minimal set of questions as last resort
      return [
        {
          id: `emergency-fallback-1`,
          session_id: sessionId || '',
          question: `Tell me about your experience and skills relevant to this ${jobRole} position.`,
          question_order: 0,
          created_at: new Date().toISOString()
        },
        {
          id: `emergency-fallback-2`,
          session_id: sessionId || '',
          question: `What interests you about working in the ${industry} industry?`,
          question_order: 1,
          created_at: new Date().toISOString()
        }
      ];
    }
  };

  const fetchQuestions = async () => {
    if (!sessionId) {
      console.error("Cannot fetch questions: No session ID provided");
      return;
    }
    
    setLoading(true);
    try {
      const questionsList = await fetchQuestionsFromDb(sessionId);
      setQuestions(questionsList);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    generateQuestions,
    generateFallbackQuestions: generateFallbackQuestionsWrapper,
    fetchQuestions,
    loading
  };
};
