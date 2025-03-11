
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

    console.log("Generating quiz with content length:", content.length, "and topics:", topics);

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
          // Indicate if we're generating without content
          contentProvided: content.length > 0
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Quiz generation failed:", errorData);
      throw new Error('Failed to generate quiz: ' + (errorData.error || response.statusText));
    }

    const data = await response.json();
    return data.quizQuestions.map((q: Question) => ({
      ...q,
      difficulty
    }));
  };

  return { generateQuiz };
};
