
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/quiz-generation";
import { toast } from "@/components/ui/use-toast";

export const useQuizSave = () => {
  const saveQuizToDatabase = async (
    questions: Question[], 
    topics: { description: string }[], 
    duration: number,
    courseId?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return false;
      }

      // Create the quiz with title, teacher_id, and duration
      const quizData = {
        title: `Quiz for ${topics.map(t => t.description).join(", ")}`,
        teacher_id: session.user.id,
        duration_minutes: duration
      };

      // Only add course_id if it exists
      if (courseId) {
        Object.assign(quizData, { course_id: courseId });
      }

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select()
        .single();

      if (quizError) throw quizError;

      // Insert all questions
      const questionsToInsert = questions.map(q => ({
        quiz_id: quiz.id,
        question: q.question,
        correct_answer: q.correctAnswer,
        topic: q.topic,
        points: q.points,
        options: q.options,
        difficulty: q.difficulty
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: "Success",
        description: "Quiz saved successfully!",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { saveQuizToDatabase };
};
