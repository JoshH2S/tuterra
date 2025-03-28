
import { Question, QuestionDifficulty } from "./types.ts";
import { DIFFICULTY_GUIDELINES } from "./config.ts";

/**
 * Validates and normalizes generated questions to ensure they meet requirements
 * @param questions Array of raw questions
 * @param difficulty Target difficulty level
 * @returns Array of validated and normalized questions
 */
export function validateAndNormalizeQuestions(questions: any[], difficulty: string): Question[] {
  // Ensure difficulty is a valid QuestionDifficulty
  const difficultyLevel = difficulty as QuestionDifficulty;
  const guidelines = DIFFICULTY_GUIDELINES[difficultyLevel];
  
  const validatedQuestions = questions.map(q => {
    // Convert points to number if it's a string
    let points = typeof q.points === 'string' ? parseInt(q.points, 10) : q.points;
    
    // Enforce points range according to difficulty level
    points = Math.min(Math.max(points, guidelines.points.min), guidelines.points.max);
    
    return {
      ...q,
      points: isNaN(points) ? guidelines.points.min : points, // Default to min if invalid
      difficulty: difficultyLevel,
      validated_at: new Date().toISOString()
    };
  });
  
  console.log(`Validated ${validatedQuestions.length} questions`);
  return validatedQuestions;
}
