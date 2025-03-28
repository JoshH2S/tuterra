
import { ContentChunk, QuestionDifficulty } from "./types.ts";
import { DIFFICULTY_GUIDELINES } from "./config.ts";

/**
 * Generates a prompt for the OpenAI API based on content chunk and difficulty
 * @param chunk Content chunk to generate questions from
 * @param difficulty Target difficulty level
 * @returns Formatted prompt string
 */
export function generatePromptForChunk(chunk: ContentChunk, difficulty: string) {
  // Ensure difficulty is a valid QuestionDifficulty
  const difficultyLevel = difficulty as QuestionDifficulty;
  const guidelines = DIFFICULTY_GUIDELINES[difficultyLevel];
  
  // Make sure to explicitly request the correct number of questions for each topic
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

Important instructions:
1. Generate EXACTLY the number of questions requested for each topic - no more, no less.
2. For topic "${chunk.topics[0].description}", create EXACTLY ${chunk.topics[0].numQuestions} questions.
${chunk.topics.slice(1).map((t, i) => `${i+3}. For topic "${t.description}", create EXACTLY ${t.numQuestions} questions.`).join('\n')}

Return a valid JSON array with each question having these fields:
{
  "question": "Question text matching ${difficulty} level",
  "options": {"A": "First option", "B": "Second option", "C": "Third option", "D": "Fourth option"},
  "correctAnswer": "A or B or C or D",
  "topic": "The topic this question belongs to - must match one of the provided topics exactly",
  "points": a number between ${guidelines.points.min} and ${guidelines.points.max},
  "explanation": "Explanation appropriate for ${difficulty} level",
  "difficulty": "${difficulty}",
  "conceptTested": "Specific concept being tested",
  "learningObjective": "Clear learning objective"
}

Return ONLY the JSON array with no additional text.`;
}
