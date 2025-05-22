
import { ContentChunk, QuestionDifficulty } from "./types.ts";
import { DIFFICULTY_GUIDELINES } from "./config.ts";

// Check if a topic is STEM-related
export function isSTEMTopic(topic: string): boolean {
  const stemKeywords = [
    "math", "mathematics", "algebra", "calculus", "geometry", "trigonometry",
    "physics", "chemistry", "biology", "computer science", "cs", "programming",
    "engineering", "statistics", "probability", "economics", "data science",
    "machine learning", "artificial intelligence", "quantum", "algorithm"
  ];
  
  const lowerTopic = topic.toLowerCase();
  return stemKeywords.some(keyword => lowerTopic.includes(keyword));
}

// Check if content chunk contains STEM topics
export function containsSTEMTopics(chunk: ContentChunk): boolean {
  return chunk.topics.some(topic => isSTEMTopic(topic.description));
}

/**
 * Generates a prompt for the OpenAI API based on content chunk and difficulty
 * @param chunk Content chunk to generate questions from
 * @param difficulty Target difficulty level
 * @returns Formatted prompt string
 */
export function generatePromptForChunk(chunk: ContentChunk, difficulty: string) {
  // If content contains STEM topics, use the specialized STEM prompt
  if (containsSTEMTopics(chunk)) {
    return generateSTEMPromptForChunk(chunk, difficulty);
  }
  
  // Standard non-STEM prompt generation (existing code)
  const difficultyLevel = difficulty as QuestionDifficulty;
  const guidelines = DIFFICULTY_GUIDELINES[difficultyLevel];
  
  const topicsWithCounts = chunk.topics
    .map(t => `${t.description} (${t.numQuestions} questions)`)
    .join(', ');
  
  const totalQuestions = chunk.topics.reduce((sum, t) => sum + t.numQuestions, 0);
  
  return `
Generate EXACTLY ${totalQuestions} multiple-choice questions from the following content, 
matching the ${difficulty} difficulty level:

Content:
${chunk.content}

Topics and question counts: ${topicsWithCounts}

Difficulty Requirements for ${difficulty}:
- Complexity Level: ${guidelines.complexity}
- Language Level: ${guidelines.language}
- Points Range: ${guidelines.points.min}-${guidelines.points.max} points per question
- Questions should challenge ${difficulty.replace('_', ' ')} level students appropriately

Topics distribution (it is CRITICAL that you follow these numbers EXACTLY):
${chunk.topics.map(t => `- ${t.description}: EXACTLY ${t.numQuestions} questions - no more, no less`).join('\n')}

Mobile-Friendly Design Requirements:
- Create concise questions (max 200-250 characters)
- Keep answer options short (max 80-100 characters)
- Use simple, clear language that's easy to read on small screens
- Use "tap" instead of "click" in instruction text
- Design with thumb zones in mind (bottom-oriented interactive elements)
- Avoid complex formatting that may render poorly on mobile

Important instructions:
1. Generate EXACTLY the number of questions requested for each topic - no more, no less.
2. For topic "${chunk.topics[0].description}", create EXACTLY ${chunk.topics[0].numQuestions} questions.
${chunk.topics.slice(1).map((t, i) => `${i+3}. For topic "${t.description}", create EXACTLY ${t.numQuestions} questions.`).join('\n')}
3. Prioritize concise, mobile-friendly questions and answers

Return a valid JSON array with each question having these fields:
{
  "question": "Question text matching ${difficulty} level (keep concise for mobile)",
  "options": {"A": "First option", "B": "Second option", "C": "Third option", "D": "Fourth option"},
  "correctAnswer": "A or B or C or D",
  "topic": "The topic this question belongs to - must match one of the provided topics exactly",
  "points": a number between ${guidelines.points.min} and ${guidelines.points.max},
  "explanation": "Brief explanation appropriate for ${difficulty} level",
  "difficulty": "${difficulty}",
  "conceptTested": "Specific concept being tested",
  "mobileOptimized": true
}

Return ONLY the JSON array with no additional text.`;
}

/**
 * Generates a specialized prompt for STEM subjects with LaTeX support
 */
export function generateSTEMPromptForChunk(chunk: ContentChunk, difficulty: string) {
  const difficultyLevel = difficulty as QuestionDifficulty;
  const guidelines = DIFFICULTY_GUIDELINES[difficultyLevel];
  
  const topicsWithCounts = chunk.topics
    .map(t => `${t.description} (${t.numQuestions} questions)`)
    .join(', ');
  
  const totalQuestions = chunk.topics.reduce((sum, t) => sum + t.numQuestions, 0);
  
  return `
Generate EXACTLY ${totalQuestions} STEM-focused multiple-choice questions from the following content, 
matching the ${difficulty} difficulty level:

Content:
${chunk.content}

Topics and question counts: ${topicsWithCounts}

Difficulty Requirements for ${difficulty}:
- Complexity Level: ${guidelines.complexity}
- Language Level: ${guidelines.language}
- Points Range: ${guidelines.points.min}-${guidelines.points.max} points per question
- Questions should challenge ${difficulty.replace('_', ' ')} level students appropriately

Topics distribution (it is CRITICAL that you follow these numbers EXACTLY):
${chunk.topics.map(t => `- ${t.description}: EXACTLY ${t.numQuestions} questions - no more, no less`).join('\n')}

STEM-SPECIFIC REQUIREMENTS:
1. Use LaTeX notation for mathematical expressions and equations
   - For inline equations, use single dollar signs: $equation$
   - For display equations, use double dollar signs: $$equation$$
   - Ensure all mathematical symbols, variables, and expressions use proper LaTeX formatting
   
2. Include step-by-step solutions in explanations
   - Break down complex problems into logical steps
   - Show all work, including intermediate calculations
   - Explain the reasoning behind each step
   
3. For topics that benefit from visualizations:
   - Include a "visualizationPrompt" field with a clear description of what should be visualized
   - Describe key elements, labels, and relationships that should be shown
   
4. For programming topics:
   - Format code properly with appropriate syntax highlighting
   - Include variable definitions and explanations
   - Explain logic and algorithms clearly

5. Extract and preserve key formulas:
   - Include a "formula" field with the main formula being tested in LaTeX notation
   - Ensure all variables in formulas are defined in the explanation

MOBILE-FRIENDLY DESIGN REQUIREMENTS:
- Create concise questions that display well on small screens (max 250 characters)
- Keep answer options brief enough to read on mobile devices (max 100 characters)
- Use touch-friendly language (e.g., "tap" instead of "click")
- Simplify complex LaTeX when possible for better mobile rendering
- Consider thumb zones when designing multiple-choice options
- Use responsive formatting that works on all device sizes

Important instructions:
1. Generate EXACTLY the number of questions requested for each topic - no more, no less.
2. For topic "${chunk.topics[0].description}", create EXACTLY ${chunk.topics[0].numQuestions} questions.
${chunk.topics.slice(1).map((t, i) => `${i+3}. For topic "${t.description}", create EXACTLY ${t.numQuestions} questions.`).join('\n')}
3. Optimize all content for mobile viewing

Return a valid JSON array with each question having these fields:
{
  "question": "Question text matching ${difficulty} level with LaTeX formatting for equations ($formula$)",
  "options": {"A": "First option", "B": "Second option", "C": "Third option", "D": "Fourth option"},
  "correctAnswer": "A or B or C or D",
  "topic": "The topic this question belongs to - must match one of the provided topics exactly",
  "points": a number between ${guidelines.points.min} and ${guidelines.points.max},
  "explanation": "Step-by-step explanation with LaTeX formatting where needed",
  "difficulty": "${difficulty}",
  "conceptTested": "Specific concept being tested",
  "formula": "Key formula in LaTeX notation if applicable",
  "visualizationPrompt": "Description of visualization if applicable",
  "mobileOptimized": true
}

Return ONLY the JSON array with no additional text.`;
}
