
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
      throw new Error('Failed to generate quiz');
    }

    const data = await response.json();
    return data.quizQuestions.map((q: Question) => ({
      ...q,
      difficulty
    }));
  };

  return { generateQuiz };
};
