
import { useState } from "react";
import { useQuizAPI } from "./useQuizAPI";
import { useQuizSave } from "./useQuizSave";
import { toast } from "@/components/ui/use-toast";
import { Topic, Question, CONTENT_LIMITS } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";

export const useQuizSubmission = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
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
      return { questions: null, quizId: null };
    }

    if (topics.some(topic => !topic.description)) {
      toast({
        title: "Error",
        description: "Please fill out all topics",
        variant: "destructive",
      });
      return { questions: null, quizId: null };
    }

    setIsProcessing(true);
    setQuizQuestions([]);
    setQuizId(null);

    try {
      const trimmedContent = fileContent.slice(0, CONTENT_LIMITS.MAX_CHARACTERS);
      
      const generatedQuestions = await generateQuiz(trimmedContent, topics, difficulty);
      setQuizQuestions(generatedQuestions);
      
      // Use the provided title or generate a default one
      const quizTitle = title.trim() ? title : `Quiz on ${topics.map(t => t.description).join(", ")}`;
      
      // Save the generated quiz to the database
      const { success, quizId } = await saveQuizToDatabase(generatedQuestions, topics, duration, quizTitle, courseId);
      
      if (success && quizId) {
        setQuizId(quizId);
        
        toast({
          title: "Success",
          description: "Quiz generated and saved successfully!",
        });
        
        return { questions: generatedQuestions, quizId };
      } else {
        throw new Error("Failed to save quiz to database");
      }
    } catch (error) {
      console.error('Error processing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
      return { questions: null, quizId: null };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    quizQuestions,
    quizId,
    handleSubmit,
  };
};
