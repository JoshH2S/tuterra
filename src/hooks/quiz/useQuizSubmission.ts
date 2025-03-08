
import { useState } from "react";
import { useQuizAPI } from "./useQuizAPI";
import { useQuizSave } from "./useQuizSave";
import { toast } from "@/components/ui/use-toast";
import { Topic, Question, MAX_CONTENT_LENGTH } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";

export const useQuizSubmission = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const { generateQuiz } = useQuizAPI();
  const { saveQuizToDatabase } = useQuizSave();

  const handleSubmit = async (
    fileContent: string,
    topics: Topic[],
    difficulty: QuestionDifficulty,
    duration: number,
    courseId?: string
  ) => {
    if (!fileContent) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    if (topics.some(topic => !topic.description)) {
      toast({
        title: "Error",
        description: "Please fill out all topics",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setQuizQuestions([]);

    try {
      const trimmedContent = fileContent.slice(0, MAX_CONTENT_LENGTH);
      
      const generatedQuestions = await generateQuiz(trimmedContent, topics, difficulty);
      setQuizQuestions(generatedQuestions);
      
      // Save the generated quiz to the database
      await saveQuizToDatabase(generatedQuestions, topics, duration, courseId);

      toast({
        title: "Success",
        description: "Quiz generated and saved successfully!",
      });

      return generatedQuestions;
    } catch (error) {
      console.error('Error processing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    quizQuestions,
    handleSubmit,
  };
};
