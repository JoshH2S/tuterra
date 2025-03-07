
import { getRoleCategory } from "./roleUtils";

// Common challenges for behavioral questions
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

// Project scenarios
const scenarios = [
  "large-scale system",
  "client-facing application",
  "internal tool",
  "legacy system migration",
  "high-performance service"
];

// Challenging situations
const situations = [
  "a disagreement with a colleague about the approach to a project",
  "conflicting priorities from different stakeholders",
  "an unexpected change in project requirements",
  "a critical system failure during a key business period",
  "a team member who is struggling to meet their responsibilities"
];

// Management challenges
const managementChallenges = [
  "lead a team through a difficult transition",
  "implement an unpopular but necessary policy",
  "motivate an underperforming team",
  "manage conflicting personalities in your team",
  "develop a high-potential but inexperienced team member"
];

// Healthcare scenarios
const patientScenarios = [
  "is resistant to the recommended treatment plan",
  "has complex and potentially conflicting health needs",
  "disagrees with your medical assessment",
  "requires coordination across multiple healthcare specialists",
  "presents with unusual or ambiguous symptoms"
];

// Financial tasks
const financialTasks = [
  "risk assessment",
  "portfolio optimization",
  "budget forecasting",
  "cost reduction analysis",
  "investment strategy development"
];

// Market conditions
const marketConditions = [
  "volatile",
  "bearish",
  "bullish",
  "rapidly changing",
  "uncertain",
  "recovering"
];

/**
 * Get a random item from an array
 */
const getRandomItem = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

/**
 * Substitute variables in templates with appropriate values
 */
export const substituteVariables = (template: string, values: Record<string, string>): string => {
  let result = template;
  
  // Substitute specific placeholders with appropriate values
  if (template.includes('{challenge}')) {
    result = result.replace('{challenge}', getRandomItem(challenges));
  }
  
  if (template.includes('{technical_concept}')) {
    const roleCategory = getRoleCategory(values.jobRole);
    const concepts = technicalConcepts[roleCategory] || technicalConcepts.any;
    result = result.replace('{technical_concept}', getRandomItem(concepts));
  }
  
  if (template.includes('{scenario}')) {
    const industrySpecificScenarios = [
      `${values.industry} project`,
      ...scenarios
    ];
    result = result.replace('{scenario}', getRandomItem(industrySpecificScenarios));
  }
  
  if (template.includes('{situation}')) {
    const industrySpecificSituations = [
      `a disagreement with a colleague about the approach to a ${values.industry} project`,
      ...situations
    ];
    result = result.replace('{situation}', getRandomItem(industrySpecificSituations));
  }
  
  if (template.includes('{management_challenge}')) {
    result = result.replace('{management_challenge}', getRandomItem(managementChallenges));
  }
  
  if (template.includes('{patient_scenario}')) {
    result = result.replace('{patient_scenario}', getRandomItem(patientScenarios));
  }
  
  if (template.includes('{financial_task}')) {
    result = result.replace('{financial_task}', getRandomItem(financialTasks));
  }
  
  if (template.includes('{market_condition}')) {
    result = result.replace('{market_condition}', getRandomItem(marketConditions));
  }
  
  // Replace any remaining variables with role and industry
  result = result.replace(/{role}/g, values.jobRole);
  result = result.replace(/{industry}/g, values.industry);
  
  return result;
};
