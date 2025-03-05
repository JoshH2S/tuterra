
export type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export type Question = {
  id: string;
  text: string;
};

// Fallback questions in case API fails or returns too few questions
export const FALLBACK_QUESTIONS = [
  "Tell me about your experience with similar roles in the past.",
  "How do you handle challenging situations in the workplace?",
  "What are your greatest strengths related to this position?",
  "Describe a time when you had to learn a new skill quickly.",
  "Where do you see yourself professionally in five years?"
];
