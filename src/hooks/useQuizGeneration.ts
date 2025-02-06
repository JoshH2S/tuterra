
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Topic {
  name: string;
  questionCount: number;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
}

export const useQuizGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const generateQuiz = async (
    title: string,
    file: File,
    topics: Topic[]
  ) => {
    try {
      setIsGenerating(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('topics', JSON.stringify(topics));
      formData.append('title', title);
      formData.append('userId', session.user.id);

      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: formData,
      });

      if (error) {
        if (error.message.includes('Too Many Requests')) {
          toast({
            title: "Service Busy",
            description: "The quiz generation service is currently busy. Please try again in a few moments.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to generate quiz. Please try again.",
            variant: "destructive",
          });
        }
        throw error;
      }

      setGeneratedQuestions(data.questions);
      
      toast({
        title: "Quiz Generated",
        description: `Successfully generated ${data.questionCount} questions.`,
      });

      return data.questions;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateQuiz,
    isGenerating,
    generatedQuestions,
  };
};
