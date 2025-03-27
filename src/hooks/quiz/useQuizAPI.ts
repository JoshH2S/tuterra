
import { supabase } from "@/integrations/supabase/client";
import { Question, Topic } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";

export const useQuizAPI = () => {
  const generateQuiz = async (
    content: string,
    topics: Topic[],
    difficulty: QuestionDifficulty
  ): Promise<Question[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No session found');
    }

    const { data: teacherData } = await supabase
      .from('profiles')
      .select('first_name, last_name, school')
      .eq('id', session.user.id)
      .single();

    try {
      const response = await fetch(
        'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-quiz',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            content,
            topics,
            difficulty,
            teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : undefined,
            school: teacherData?.school,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to generate quiz:', errorData);
        
        const error = new Error('Failed to generate quiz: ' + (errorData.error || 'Unknown error')) as Error & { cause?: any };
        error.cause = errorData.details || JSON.stringify(errorData);
        throw error;
      }

      const data = await response.json();
      
      if (!data.quizQuestions || !Array.isArray(data.quizQuestions)) {
        throw new Error('Invalid response format: questions not found in response');
      }
      
      return data.quizQuestions.map((q: Question) => ({
        ...q,
        difficulty
      }));
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  };

  return { generateQuiz };
};
