
import { InterviewQuestion } from "@/types/interview";
import { formatJobRole } from "./roleUtils";

/**
 * Legacy method for generating fallback questions if database templates fail
 * Provides a reliable set of basic interview questions
 */
export const generateLegacyFallbackQuestions = (
  jobRole: string,
  industry: string,
  sessionId: string | null
): InterviewQuestion[] => {
  const currentDate = new Date().toISOString();
  const displayJobRole = formatJobRole(jobRole);
  
  const baseQuestions = [
    {
      id: `fallback-1`,
      session_id: sessionId || '',
      question: `Tell me about your experience as a ${displayJobRole}.`,
      question_order: 0,
      created_at: currentDate
    },
    {
      id: `fallback-2`,
      session_id: sessionId || '',
      question: `What interests you about working in ${industry}?`,
      question_order: 1,
      created_at: currentDate
    },
    {
      id: `fallback-3`,
      session_id: sessionId || '',
      question: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
      question_order: 2,
      created_at: currentDate
    },
    {
      id: `fallback-4`,
      session_id: sessionId || '',
      question: `What specific skills do you have that make you qualified for this ${displayJobRole} position?`,
      question_order: 3,
      created_at: currentDate
    },
    {
      id: `fallback-5`,
      session_id: sessionId || '',
      question: `Where do you see yourself professionally in five years?`,
      question_order: 4,
      created_at: currentDate
    }
  ];

  // Add industry-specific questions
  if (industry.toLowerCase().includes('tech') || 
      industry.toLowerCase().includes('technology')) {
    baseQuestions.push({
      id: `fallback-6`,
      session_id: sessionId || '',
      question: "Describe a technical project you worked on that you're particularly proud of.",
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase().includes('finance')) {
    baseQuestions.push({
      id: `fallback-6`,
      session_id: sessionId || '',
      question: "How do you ensure accuracy and attention to detail in your financial work?",
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase().includes('health')) {
    baseQuestions.push({
      id: `fallback-6`,
      session_id: sessionId || '',
      question: "How do you balance patient care with administrative responsibilities?",
      question_order: 5,
      created_at: currentDate
    });
  }
  
  // Add role-specific questions based on keywords
  if (jobRole.toLowerCase().includes('manager') || 
      jobRole.toLowerCase().includes('leader')) {
    baseQuestions.push({
      id: `fallback-7`,
      session_id: sessionId || '',
      question: "Describe your management style and how you motivate your team.",
      question_order: 6,
      created_at: currentDate
    });
  } else if (jobRole.toLowerCase().includes('engineer') || 
             jobRole.toLowerCase().includes('developer')) {
    baseQuestions.push({
      id: `fallback-7`,
      session_id: sessionId || '',
      question: "How do you approach debugging and troubleshooting complex technical issues?",
      question_order: 6,
      created_at: currentDate
    });
  } else if (jobRole.toLowerCase().includes('analyst')) {
    baseQuestions.push({
      id: `fallback-7`,
      session_id: sessionId || '',
      question: "Describe how you would approach analyzing a complex dataset to extract meaningful insights.",
      question_order: 6,
      created_at: currentDate
    });
  }
  
  return baseQuestions;
};

/**
 * Emergency fallback questions as a last resort
 * Returns a minimal set of questions that will work in any scenario
 */
export const generateEmergencyFallbackQuestions = (
  jobRole: string,
  industry: string,
  sessionId: string | null
): InterviewQuestion[] => {
  const currentDate = new Date().toISOString();
  const displayJobRole = formatJobRole(jobRole);
  
  return [
    {
      id: `emergency-fallback-1`,
      session_id: sessionId || '',
      question: `Tell me about your experience and skills relevant to this ${displayJobRole} position.`,
      question_order: 0,
      created_at: currentDate
    },
    {
      id: `emergency-fallback-2`,
      session_id: sessionId || '',
      question: `What interests you about working in the ${industry} industry?`,
      question_order: 1,
      created_at: currentDate
    },
    {
      id: `emergency-fallback-3`,
      session_id: sessionId || '',
      question: "Describe a challenging project you've worked on and what you learned from it.",
      question_order: 2,
      created_at: currentDate
    }
  ];
};
