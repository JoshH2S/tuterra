
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

interface OpenAIQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  topic: string;
}

export const useQuizGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const transformOpenAIResponse = (questions: OpenAIQuestion[]): Question[] => {
    return questions.map(q => ({
      question: q.question,
      options: [q.options.A, q.options.B, q.options.C, q.options.D],
      correctAnswer: q.correct_answer,
      topic: q.topic
    }));
  };

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

      // Get teacher profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, school')
        .eq('id', session.user.id)
        .single();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('topics', JSON.stringify(topics));
      formData.append('title', title);
      formData.append('userId', session.user.id);
      
      // Add teacher context
      if (profile) {
        const teacherName = `${profile.first_name} ${profile.last_name}`.trim();
        if (teacherName) formData.append('teacherName', teacherName);
        if (profile.school) formData.append('school', profile.school);
      }

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

      if (data.contentTrimmed) {
        toast({
          title: "Content Trimmed",
          description: "Your content was trimmed to 5000 characters to ensure optimal processing.",
          variant: "default",
        });
      }

      const transformedQuestions = transformOpenAIResponse(data.questions);
      setGeneratedQuestions(transformedQuestions);
      
      toast({
        title: "Quiz Generated",
        description: `Successfully generated ${transformedQuestions.length} questions.`,
      });

      return transformedQuestions;
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
