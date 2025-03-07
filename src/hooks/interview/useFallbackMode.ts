
import { useState } from "react";
import { InterviewQuestion } from "@/types/interview";
import { v4 as uuidv4 } from "@/lib/uuid";

/**
 * Hook for managing fallback interview mode when normal generation fails
 */
export const useFallbackMode = (
  setCurrentSessionId: (id: string) => void,
  setQuestions: (questions: InterviewQuestion[]) => void,
  generateFallbackQuestions: (jobRole: string, industry: string) => Promise<InterviewQuestion[]>
) => {
  const [usedFallbackQuestions, setUsedFallbackQuestions] = useState(false);

  const handleFallbackMode = async (jobRole: string, industry: string) => {
    console.log("Using fallback interview mode...");
    const sessionId = uuidv4();
    setCurrentSessionId(sessionId);
    
    try {
      const fallbackQuestions = await generateFallbackQuestions(jobRole, industry);
      setQuestions(fallbackQuestions);
      setUsedFallbackQuestions(true);
      return { success: true, sessionId };
    } catch (error) {
      console.error("Error generating fallback questions:", error);
      
      // Use minimal emergency questions as last resort
      setQuestions([
        {
          id: `emergency-fallback-1`,
          session_id: sessionId,
          question: `Tell me about your experience and skills related to ${jobRole}.`,
          question_order: 0,
          created_at: new Date().toISOString()
        },
        {
          id: `emergency-fallback-2`,
          session_id: sessionId,
          question: `Why are you interested in this ${jobRole} position?`,
          question_order: 1,
          created_at: new Date().toISOString()
        }
      ]);
      
      setUsedFallbackQuestions(true);
      return { success: true, sessionId };
    }
  };

  return {
    handleFallbackMode,
    usedFallbackQuestions
  };
};
