
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

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
    console.log(`Attempting to generate interview questions for session ${sessionId} (${jobTitle} in ${industry})`);
    
    try {
      // For the API, we're using jobRole, not jobTitle
      // This ensures we map from jobTitle (UI term) to jobRole (API term) consistently
      const params = { industry, jobRole: jobTitle, jobDescription, sessionId };
      const formattedQuestions = await generateQuestionsFromApi(params, (error) => {
        console.error("Error in generateQuestionsFromApi:", error);
      });
      
      if (formattedQuestions && formattedQuestions.length > 0) {
        console.log(`Successfully generated ${formattedQuestions.length} questions for session ${sessionId}`);
        setQuestions(formattedQuestions);
        toast({
          title: "Questions generated",
          description: "Your interview questions are ready. Let's start the interview!",
        });
        return formattedQuestions;
      } else {
        throw new Error("No questions were returned from the API");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      
      // Show more detailed error to the user
      toast({
        title: "Error generating questions",
        description: error instanceof Error ? error.message : "Failed to generate interview questions. Falling back to local questions.",
        variant: "destructive"
      });
      
      // Try to use fallback questions instead
      try {
        console.log("Attempting to use fallback questions due to API error");
        const fallbackQuestions = await generateFallbackQuestionsWrapper(jobTitle, industry);
        setQuestions(fallbackQuestions);
        return fallbackQuestions;
      } catch (fallbackError) {
        console.error("Error generating fallback questions:", fallbackError);
        throw error; // Let the calling code handle this
      }
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
      return [];
    }
    
    setLoading(true);
    try {
      console.log(`Fetching questions for session ${sessionId}`);
      const questionsList = await fetchQuestionsFromDb(sessionId);
      
      if (questionsList && questionsList.length > 0) {
        console.log(`Successfully fetched ${questionsList.length} questions for session ${sessionId}`);
        setQuestions(questionsList);
        return questionsList;
      } else {
        console.warn(`No questions found for session ${sessionId}, may need to generate them`);
        return [];
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview questions. Please try again.",
        variant: "destructive",
      });
      return [];
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
