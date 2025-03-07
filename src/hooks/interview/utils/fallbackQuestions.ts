
import { EnhancedInterviewQuestion, InterviewQuestion } from "@/types/interview";
import { supabase } from "@/integrations/supabase/client";

// Helper function to determine the role category
const getRoleCategory = (role: string): string => {
  const roleNormalized = role.toLowerCase();
  
  if (roleNormalized.includes('manager') || roleNormalized.includes('director') || roleNormalized.includes('lead')) {
    return 'management';
  } else if (roleNormalized.includes('engineer') || roleNormalized.includes('developer') || roleNormalized.includes('programmer')) {
    return 'development';
  } else if (roleNormalized.includes('analyst') || roleNormalized.includes('data')) {
    return 'analyst';
  } else if (roleNormalized.includes('design')) {
    return 'design';
  } else if (roleNormalized.includes('sales') || roleNormalized.includes('marketing')) {
    return 'sales';
  } else if (roleNormalized.includes('doctor') || roleNormalized.includes('nurse') || roleNormalized.includes('healthcare')) {
    return 'healthcare';
  } else if (roleNormalized.includes('finance') || roleNormalized.includes('accountant')) {
    return 'finance';
  }
  
  return 'any';
};

// Helper function to substitute variables in templates
const substituteVariables = (template: string, values: Record<string, string>) => {
  let result = template;
  
  // Common substitutions for challenges
  const challenges = [
    "overcome a difficult challenge",
    "work under tight deadlines",
    "resolve a conflict within a team",
    "adapt to a major change",
    "deal with a difficult client or stakeholder",
    "prioritize competing tasks",
    "learn a new skill quickly",
    "handle a project failure"
  ];
  
  // Technical concepts based on role
  const technicalConcepts: Record<string, string[]> = {
    'development': [
      "a complex algorithm",
      "an API integration",
      "a database optimization",
      "a caching system",
      "a responsive UI component"
    ],
    'management': [
      "a project management methodology",
      "a team performance evaluation system",
      "a resource allocation strategy",
      "a cross-departmental collaboration framework"
    ],
    'analyst': [
      "a data normalization process",
      "a predictive model",
      "a business intelligence dashboard",
      "an A/B testing framework"
    ],
    'finance': [
      "a financial forecasting model",
      "a risk assessment strategy",
      "a budgeting process",
      "a cost reduction analysis"
    ],
    'any': [
      "a process improvement",
      "a quality assurance system",
      "a customer feedback mechanism",
      "a reporting system"
    ]
  };
  
  // Substitute specific placeholders with appropriate values
  if (template.includes('{challenge}')) {
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    result = result.replace('{challenge}', randomChallenge);
  }
  
  if (template.includes('{technical_concept}')) {
    const roleCategory = getRoleCategory(values.jobRole);
    const concepts = technicalConcepts[roleCategory] || technicalConcepts.any;
    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
    result = result.replace('{technical_concept}', randomConcept);
  }
  
  if (template.includes('{scenario}')) {
    const scenarios = [
      `${values.industry} project`,
      "large-scale system",
      "client-facing application",
      "internal tool",
      "legacy system migration"
    ];
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    result = result.replace('{scenario}', randomScenario);
  }
  
  if (template.includes('{situation}')) {
    const situations = [
      `a disagreement with a colleague about the approach to a ${values.industry} project`,
      "conflicting priorities from different stakeholders",
      "an unexpected change in project requirements",
      "a critical system failure during a key business period",
      `a team member who is struggling to meet their responsibilities as a ${values.jobRole}`
    ];
    const randomSituation = situations[Math.floor(Math.random() * situations.length)];
    result = result.replace('{situation}', randomSituation);
  }
  
  if (template.includes('{management_challenge}')) {
    const challenges = [
      "lead a team through a difficult transition",
      "implement an unpopular but necessary policy",
      "motivate an underperforming team",
      "manage conflicting personalities in your team",
      "develop a high-potential but inexperienced team member"
    ];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    result = result.replace('{management_challenge}', randomChallenge);
  }
  
  if (template.includes('{patient_scenario}')) {
    const scenarios = [
      "is resistant to the recommended treatment plan",
      "has complex and potentially conflicting health needs",
      "disagrees with your medical assessment",
      "requires coordination across multiple healthcare specialists",
      "presents with unusual or ambiguous symptoms"
    ];
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    result = result.replace('{patient_scenario}', randomScenario);
  }
  
  if (template.includes('{financial_task}')) {
    const tasks = [
      "risk assessment",
      "portfolio optimization",
      "budget forecasting",
      "cost reduction analysis",
      "investment strategy development"
    ];
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    result = result.replace('{financial_task}', randomTask);
  }
  
  if (template.includes('{market_condition}')) {
    const conditions = [
      "volatile",
      "bearish",
      "bullish",
      "rapidly changing",
      "uncertain",
      "recovering"
    ];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    result = result.replace('{market_condition}', randomCondition);
  }
  
  // Replace any remaining variables with role and industry
  result = result.replace(/{role}/g, values.jobRole);
  result = result.replace(/{industry}/g, values.industry);
  
  return result;
};

/**
 * Generates fallback interview questions based on templates from the database
 */
export const generateFallbackQuestions = async (
  jobRole: string, 
  industry: string, 
  sessionId: string | null
): Promise<InterviewQuestion[]> => {
  const currentDate = new Date().toISOString();
  const roleCategory = getRoleCategory(jobRole);
  
  try {
    // Try to fetch templates from the database
    const { data: templates, error } = await supabase
      .from('question_templates')
      .select('*')
      .or(`industry.eq.${industry},industry.eq.general`)
      .or(`role_category.eq.${roleCategory},role_category.eq.any`)
      .limit(10);
    
    if (error || !templates || templates.length === 0) {
      console.warn("Failed to fetch question templates or none found:", error);
      return generateLegacyFallbackQuestions(jobRole, industry, sessionId);
    }
    
    // Format job role for display by replacing hyphens and capitalizing words
    const formatJobRole = (role: string): string => {
      return role
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    const displayJobRole = formatJobRole(jobRole);
    
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
    return generateLegacyFallbackQuestions(jobRole, industry, sessionId);
  }
};

/**
 * Legacy method for generating fallback questions if database templates fail
 */
const generateLegacyFallbackQuestions = (
  jobRole: string,
  industry: string,
  sessionId: string | null
): InterviewQuestion[] => {
  const currentDate = new Date().toISOString();
  
  // Format job role for display by replacing hyphens and capitalizing words
  const formatJobRole = (role: string): string => {
    return role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
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
  
  // Add role-specific questions based on keywords, not format
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
