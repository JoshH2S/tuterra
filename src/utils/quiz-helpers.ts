
import { Question } from "@/types/quiz-generation";

/**
 * Shuffles the options of a quiz question while preserving the correct answer
 * @param question The original question with options
 * @returns A new question object with shuffled options and updated correctAnswer
 */
export function shuffleQuestionOptions(question: Question): Question {
  if (!question.options || !question.correctAnswer) {
    return question;
  }

  // Store the correct answer text
  const correctAnswerText = question.options[question.correctAnswer];
  
  // Get all option entries and shuffle them
  const optionEntries = Object.entries(question.options);
  const shuffledEntries = [...optionEntries].sort(() => Math.random() - 0.5);
  
  // Create new options object with shuffled entries
  const shuffledOptions: Record<string, string> = {};
  shuffledEntries.forEach(([key, value], index) => {
    const newKey = String.fromCharCode(65 + index); // 'A', 'B', 'C', 'D'
    shuffledOptions[newKey] = value;
    
    // Update correct answer if this is the correct option
    if (value === correctAnswerText) {
      question.correctAnswer = newKey;
    }
  });
  
  // Return new question with shuffled options
  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: question.correctAnswer
  };
}

/**
 * Shuffles options for an array of questions
 * @param questions Array of questions to shuffle
 * @returns New array with shuffled options
 */
export function shuffleQuestionsOptions(questions: Question[]): Question[] {
  return questions.map(question => shuffleQuestionOptions(question));
}
