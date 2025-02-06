import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { processFileContent } from "@/utils/file-utils";

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

      // Process the uploaded file
      const processedFile = await processFileContent(file);

      // Generate questions using the Edge Function
      const { data: generatedData, error: generationError } = await supabase.functions
        .invoke('generate-quiz', {
          body: {
            courseContent: processedFile.content,
            topics,
          },
        });

      if (generationError) throw generationError;

      // Create the quiz in the database
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title,
          course_id: courseId,
          teacher_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Insert the generated questions
      const questions = generatedData.questions.map((q: any) => ({
        quiz_id: quiz.id,
        question: q.question,
        correct_answer: q.correct_answer,
        topic: q.topic,
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questions);

      if (questionsError) throw questionsError;

      toast({
        title: "Quiz Generated",
        description: "Your quiz has been created successfully.",
      });

      return quiz.id;
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