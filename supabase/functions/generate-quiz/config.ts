
import { DifficultyGuideline, QuestionDifficulty } from "./types.ts";

// Processing limits
export const LIMITS = {
  MAX_FILE_SIZE: 75_000, // Maximum content size in characters
  MAX_CHUNK_SIZE: 12_000, // Maximum size for each processing chunk
  MAX_TOKENS_PER_REQUEST: 14_000, // Safe limit for GPT-3.5-turbo
};

// Difficulty guidelines for different education levels
export const DIFFICULTY_GUIDELINES: Record<QuestionDifficulty, DifficultyGuideline> = {
  middle_school: {
    complexity: "basic concepts and definitions",
    language: "simple and clear language",
    points: { min: 1, max: 2 }
  },
  high_school: {
    complexity: "intermediate concepts and basic applications",
    language: "straightforward academic language",
    points: { min: 2, max: 3 }
  },
  university: {
    complexity: "advanced concepts and practical applications",
    language: "technical academic language",
    points: { min: 3, max: 4 }
  },
  post_graduate: {
    complexity: "expert-level concepts and complex analysis",
    language: "sophisticated technical language",
    points: { min: 4, max: 5 }
  }
};

// CORS headers for responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
