
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/quiz-generation";
import { toast } from "@/components/ui/use-toast";

// Define the valid difficulty types to match the database enum
type QuestionDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

export const useQuizSave = () => {
  const saveQuizToDatabase = async (
    questions: Question[], 
    topics: { description: string }[], 
    duration: number,
    title: string = "Untitled Quiz", // Default title if none provided
    courseId?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, quizId: null };
      }

      // Create the quiz with title, teacher_id, and duration
      const quizData = {
        title: title, // Use the provided title or default
        teacher_id: session.user.id,
        duration_minutes: duration,
        published: false // Add explicit published flag
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

      // Map questions to the database schema
      const questionsToInsert = questions.map(q => ({
        quiz_id: quiz.id,
        question: q.question,
        correct_answer: q.correctAnswer,
        topic: q.topic,
        points: q.points,
        options: q.options,
        difficulty: mapDifficultyToDatabase(q.difficulty) as QuestionDifficulty
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: "Success",
        description: "Quiz saved successfully!",
      });
      
      return { success: true, quizId: quiz.id };
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
      return { success: false, quizId: null };
    }
  };

  // Helper function to map our difficulty levels to database values
  const mapDifficultyToDatabase = (difficulty: string): QuestionDifficulty => {
    switch (difficulty) {
      case "middle_school":
        return "beginner";
      case "high_school":
        return "intermediate";
      case "university":
        return "advanced";
      case "post_graduate":
        return "expert";
      default:
        return "intermediate";
    }
  };

  return { saveQuizToDatabase };
};
