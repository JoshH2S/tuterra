
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Topic {
  name: string;
  questionCount: number;
}

export const useQuizGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuiz = async (
    courseId: string,
    title: string,
    file: File,
    topics: Topic[]
  ) => {
    try {
      setIsGenerating(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('topics', JSON.stringify(topics));
      formData.append('courseId', courseId);
      formData.append('title', title);
      formData.append('teacherId', (await supabase.auth.getUser()).data.user?.id || '');

      const { data, error } = await supabase.functions
        .invoke('generate-quiz', {
          body: formData,
        });

      if (error) throw error;

      toast({
        title: "Quiz Generated",
        description: `Successfully created quiz with ${data.questionCount} questions.`,
      });

      return data.quizId;
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateQuiz,
    isGenerating,
  };
};
