
import { InterviewQuestion } from "@/types/interview";
import { getRoleCategory, formatJobRole, fetchQuestionTemplates } from "./roleUtils";
import { substituteVariables } from "./templateSubstitution";
import { generateLegacyFallbackQuestions, generateEmergencyFallbackQuestions } from "./legacyFallbackQuestions";

/**
 * Generates fallback interview questions based on templates from the database
 * Falls back to legacy questions if templates are unavailable
 */
export const generateFallbackQuestions = async (
  jobRole: string, 
  industry: string, 
  sessionId: string | null
): Promise<InterviewQuestion[]> => {
  const currentDate = new Date().toISOString();
  const roleCategory = getRoleCategory(jobRole);
  const displayJobRole = formatJobRole(jobRole);
  
  try {
    // Try to fetch templates from the database
    const templates = await fetchQuestionTemplates(industry, roleCategory);
    
    if (!templates || templates.length === 0) {
      console.warn("No question templates found in database");
      return generateLegacyFallbackQuestions(jobRole, industry, sessionId);
    }
    
    // Map templates to questions
    return templates.map((template, index) => {
      const questionText = substituteVariables(template.template, {
        jobRole: displayJobRole,
        industry: industry
      });
      
      return {
        id: `template-${template.id}-${index}`,
        session_id: sessionId || '',
        question: questionText,
        question_order: index,
        created_at: currentDate
      };
    });
  } catch (error) {
    console.error("Error generating fallback questions from templates:", error);
    
    try {
      return generateLegacyFallbackQuestions(jobRole, industry, sessionId);
    } catch (secondaryError) {
      console.error("Error in legacy fallback generation:", secondaryError);
      return generateEmergencyFallbackQuestions(jobRole, industry, sessionId);
    }
  }
};
