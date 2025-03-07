
import { EnhancedInterviewQuestion } from "./types.ts";

// Generate basic fallback interview questions as backup
export function generateBasicInterviewQuestions(industry: string, role: string, jobDescription?: string): EnhancedInterviewQuestion[] {
  const currentDate = new Date().toISOString();
  
  // Format role name for better display
  const formattedRole = role
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  const baseQuestions: EnhancedInterviewQuestion[] = [
    {
      id: crypto.randomUUID(),
      text: `Tell me about your experience as a ${formattedRole} in the ${industry} industry.`,
      category: "behavioral",
      difficulty: "entry",
      estimatedTimeSeconds: 120,
      keywords: [role.toLowerCase(), industry.toLowerCase(), "experience"],
      expectedTopics: ["previous roles", "responsibilities", "achievements"],
      followUp: ["What specific skills did you develop?", "How did your experience prepare you for this role?"],
      question_order: 0,
      created_at: currentDate
    },
    {
      id: crypto.randomUUID(),
      text: `What skills do you have that make you a good fit for this ${formattedRole} position?`,
      category: "behavioral",
      difficulty: "entry",
      estimatedTimeSeconds: 90,
      keywords: [role.toLowerCase(), "skills", "qualifications"],
      expectedTopics: ["technical skills", "soft skills", "relevant qualifications"],
      followUp: ["How have you applied these skills in previous roles?"],
      question_order: 1,
      created_at: currentDate
    },
    {
      id: crypto.randomUUID(),
      text: `Describe a challenging situation you've faced in a previous role and how you handled it.`,
      category: "behavioral",
      difficulty: "intermediate",
      estimatedTimeSeconds: 150,
      keywords: ["challenge", "problem-solving", "experience"],
      expectedTopics: ["problem identification", "solution approach", "results"],
      followUp: ["What would you do differently now?"],
      question_order: 2,
      created_at: currentDate
    },
    {
      id: crypto.randomUUID(),
      text: `How do you stay updated with trends and changes in the ${industry} industry?`,
      category: "technical",
      difficulty: "intermediate",
      estimatedTimeSeconds: 100,
      keywords: [industry.toLowerCase(), "trends", "professional development"],
      expectedTopics: ["learning sources", "industry publications", "networking"],
      followUp: ["What recent industry trend do you find most interesting?"],
      question_order: 3,
      created_at: currentDate
    },
    {
      id: crypto.randomUUID(),
      text: `Where do you see yourself professionally in five years?`,
      category: "behavioral",
      difficulty: "intermediate",
      estimatedTimeSeconds: 90,
      keywords: ["goals", "career development", "ambition"],
      expectedTopics: ["career goals", "growth plans", "aspirations"],
      followUp: ["How does this role fit into your long-term plans?"],
      question_order: 4,
      created_at: currentDate
    }
  ];
  
  // Add industry-specific questions
  if (industry.toLowerCase() === 'technology' || industry.toLowerCase() === 'tech') {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "Describe a technical project you worked on that you're particularly proud of.",
      category: "technical",
      difficulty: "advanced",
      estimatedTimeSeconds: 150,
      keywords: ["project", "technical", "achievement"],
      expectedTopics: ["project goals", "technologies used", "personal contribution", "outcomes"],
      followUp: ["What technical challenges did you overcome?", "How did you measure success?"],
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'finance') {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "How do you ensure accuracy and attention to detail in your financial work?",
      category: "technical",
      difficulty: "intermediate",
      estimatedTimeSeconds: 120,
      keywords: ["finance", "accuracy", "detail-oriented"],
      expectedTopics: ["quality control processes", "error prevention", "review methodologies"],
      followUp: ["Can you describe a time when your attention to detail prevented a significant error?"],
      question_order: 5,
      created_at: currentDate
    });
  } else if (industry.toLowerCase() === 'healthcare') {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "How do you balance patient care with administrative responsibilities?",
      category: "situational",
      difficulty: "advanced",
      estimatedTimeSeconds: 140,
      keywords: ["healthcare", "patient care", "administration"],
      expectedTopics: ["time management", "prioritization", "delegation"],
      followUp: ["How do you maintain quality of care under time constraints?"],
      question_order: 5,
      created_at: currentDate
    });
  }
  
  // Add role-specific questions
  if (role.toLowerCase().includes('manager') || role.toLowerCase().includes('leader')) {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "Describe your management style and how you motivate your team.",
      category: "role-specific",
      difficulty: "advanced",
      estimatedTimeSeconds: 150,
      keywords: ["management", "leadership", "team motivation"],
      expectedTopics: ["leadership philosophy", "motivation techniques", "team development"],
      followUp: ["How do you handle conflicts within your team?", "How do you adapt your style to different team members?"],
      question_order: 6,
      created_at: currentDate
    });
  } else if (role.toLowerCase().includes('engineer') || role.toLowerCase().includes('developer')) {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "How do you approach debugging and troubleshooting complex technical issues?",
      category: "problem-solving",
      difficulty: "advanced",
      estimatedTimeSeconds: 150,
      keywords: ["debugging", "troubleshooting", "technical"],
      expectedTopics: ["systematic approach", "tools used", "root cause analysis"],
      followUp: ["Describe a particularly difficult bug you solved and how you approached it."],
      question_order: 6,
      created_at: currentDate
    });
  } else if (role.toLowerCase().includes('analyst')) {
    baseQuestions.push({
      id: crypto.randomUUID(),
      text: "Describe how you would approach analyzing a complex dataset to extract meaningful insights.",
      category: "technical",
      difficulty: "advanced",
      estimatedTimeSeconds: 160,
      keywords: ["analysis", "data", "insights"],
      expectedTopics: ["data cleaning", "analysis methodology", "visualization", "communication of findings"],
      followUp: ["What tools do you typically use for data analysis?", "How do you validate your findings?"],
      question_order: 6,
      created_at: currentDate
    });
  }
  
  // Add a situational question
  baseQuestions.push({
    id: crypto.randomUUID(),
    text: `How would you handle a situation where you need to meet a tight deadline but you're waiting on input from colleagues who are unavailable?`,
    category: "situational",
    difficulty: "intermediate",
    estimatedTimeSeconds: 120,
    keywords: ["deadlines", "teamwork", "problem-solving"],
    expectedTopics: ["communication strategies", "contingency planning", "prioritization"],
    followUp: ["How would you prevent this situation in the future?"],
    question_order: baseQuestions.length,
    created_at: currentDate
  });

  return baseQuestions;
}
