
import { useState } from "react";
import { useQuizAPI } from "./useQuizAPI";
import { useQuizSave } from "./useQuizSave";
import { toast } from "@/components/ui/use-toast";
import { Topic, Question, CONTENT_LIMITS } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";

interface SubmissionError {
  message: string;
  details?: string;
}

export const useQuizSubmission = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [error, setError] = useState<SubmissionError | null>(null);
  const { generateQuiz } = useQuizAPI();
  const { saveQuizToDatabase } = useQuizSave();

  const handleSubmit = async (
    fileContent: string,
    topics: Topic[],
    difficulty: QuestionDifficulty,
    title: string,
    duration: number,
    courseId?: string
  ) => {
    if (!fileContent) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return { questions: null, quizId: null, error: { message: "No file content provided" } };
    }

    if (topics.some(topic => !topic.description)) {
      toast({
        title: "Error",
        description: "Please fill out all topics",
        variant: "destructive",
      });
      return { questions: null, quizId: null, error: { message: "Topics incomplete" } };
    }

    setIsProcessing(true);
    setQuizQuestions([]);
    setQuizId(null);
    setError(null);

    try {
      const trimmedContent = fileContent.slice(0, CONTENT_LIMITS.MAX_CHARACTERS);
      
      // Pass the topics with numQuestions to make sure it respects the requested count
      const filteredTopics = topics.filter(t => !!t.description);
      console.log("Generating quiz with topics:", filteredTopics);
      
      const generatedQuestions = await generateQuiz(trimmedContent, filteredTopics, difficulty);
      setQuizQuestions(generatedQuestions);
      
      // Use the provided title or generate a default one
      const quizTitle = title.trim() ? title : `Quiz on ${filteredTopics.map(t => t.description).join(", ")}`;
      
      // Explicitly pass the courseId if available - this was missing or inconsistently applied
      const { success, quizId } = await saveQuizToDatabase(
        generatedQuestions, 
        filteredTopics, 
        duration, 
        quizTitle, 
        courseId || undefined  // Make sure we pass undefined if courseId is empty string
      );
      
      if (success && quizId) {
        setQuizId(quizId);
        
        toast({
          title: "Success",
          description: "Quiz generated and saved successfully!",
        });
        
        return { questions: generatedQuestions, quizId, error: null };
      } else {
        throw new Error("Failed to save quiz to database");
      }
    } catch (err) {
      console.error('Error processing quiz:', err);
      
      const errorMessage = err instanceof Error ? err.message : "Failed to generate quiz";
      let errorDetails: string | undefined = undefined;
      
      if (err instanceof Error) {
        const anyErr = err as any;
        errorDetails = anyErr.details || anyErr.errorDetails || JSON.stringify(err);
      }
      
      const errorObj = { 
        message: errorMessage, 
        details: errorDetails 
      };
      
      setError(errorObj);
      
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
      
      return { questions: null, quizId: null, error: errorObj };
    } finally {
      setIsProcessing(false);
    }
  };

  const retrySubmission = async (
    fileContent: string,
    topics: Topic[],
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
    retrySubmission,
  };
};
