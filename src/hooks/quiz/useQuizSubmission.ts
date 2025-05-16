
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { QuestionDifficulty, Question } from "@/types/quiz";
import { useQuizAPI } from "./useQuizAPI";
import { useQuizSave } from "./useQuizSave";
import { Question as GenerationQuestion } from "@/types/quiz-generation";

export const useQuizSubmission = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const { generateQuiz } = useQuizAPI();
  const { saveQuizToDatabase } = useQuizSave();

  // Helper function to convert Question types
  const convertToQuizQuestion = (questions: GenerationQuestion[]): Question[] => {
    return questions.map(q => ({
      ...q,
      difficulty: q.difficulty || 'university' as QuestionDifficulty, // Ensure difficulty is always set
    })) as Question[];
  };

  const handleSubmit = async (
    fileContent: string,
    topics: { description: string; numQuestions: number }[],
    difficulty: QuestionDifficulty,
    title: string,
    duration: number,
    courseId?: string
  ) => {
    setIsProcessing(true);
    setQuizQuestions([]);
    setError(null);
    
    try {
      // Generate quiz questions
      const generatedQuestions = await generateQuiz(fileContent, topics, difficulty);
      // Convert to the correct Question type
      const convertedQuestions = convertToQuizQuestion(generatedQuestions);
      setQuizQuestions(convertedQuestions);
      
      // Save quiz to database
      const { success, quizId } = await saveQuizToDatabase(
        convertedQuestions,
        title || `Quiz for ${topics.map(t => t.description).join(", ")}`,
        duration || 15,
        courseId
      );
      
      if (success && quizId) {
        setQuizId(quizId);
        toast({
          title: "Success",
          description: "Quiz generated and saved successfully!",
        });
        return { success: true, quizId };
      } else {
        throw new Error("Failed to save quiz to database");
      }
    } catch (error) {
      console.error('Error processing quiz:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsProcessing(false);
    }
  };
  
  const retrySubmission = async (
    fileContent: string,
    topics: { description: string; numQuestions: number }[],
    difficulty: QuestionDifficulty,
    title: string,
    duration: number,
    courseId?: string
  ) => {
    setError(null);
    return handleSubmit(fileContent, topics, difficulty, title, duration, courseId);
  };

  return {
    isProcessing,
    quizQuestions,
    quizId,
    error,
    handleSubmit,
    retrySubmission
  };
};
