
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Topic, Question, QuestionDifficulty } from "@/types/quiz";
import { useQuizSave } from "@/hooks/quiz/useQuizSave";

interface NewsSource {
  title: string;
  source: string;
  url: string;
}

export const useGenerateQuiz = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [newsSources, setNewsSources] = useState<NewsSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { saveQuizToDatabase } = useQuizSave();

  const generateQuiz = async (
    topics: Topic[],
    selectedCourseId: string,
    difficulty: QuestionDifficulty
  ) => {
    if (!topics[0].description || !selectedCourseId) {
      toast({
        title: "Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return false;
    }

    setIsGenerating(true);
    setQuizQuestions([]);
    setNewsSources([]);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session');
      }

      const { data: teacherData } = await supabase
        .from('profiles')
        .select('first_name, last_name, school')
        .eq('id', session.user.id)
        .single();

      console.log("Sending request to generate case study quiz with topics:", topics);
      
      const response = await fetch(
        'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-case-study-quiz',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            topics,
            courseId: selectedCourseId,
            difficulty,
            teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : undefined,
            school: teacherData?.school,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(`Failed to generate quiz: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("Received quiz data:", data);
      
      if (!data.quizQuestions || !Array.isArray(data.quizQuestions)) {
        throw new Error("Invalid quiz data received from server");
      }
      
      setQuizQuestions(data.quizQuestions);
      
      // Store news sources if available
      if (data.metadata && data.metadata.newsSourcesUsed) {
        setNewsSources(data.metadata.newsSourcesUsed);
      }

      // Save quiz to database using the shared hook
      const success = await saveQuizToDatabase(
        data.quizQuestions, 
        topics, 
        30, // Default duration
        selectedCourseId
      );

      if (success) {
        toast({
          title: "Success",
          description: "Case study quiz generated and saved successfully!",
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error generating case study quiz:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : "Failed to generate quiz. Please try again.";
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    quizQuestions,
    newsSources,
    error,
    generateQuiz
  };
};
