
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQuizTaking } from "@/hooks/quiz/useQuizTaking";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizLoading } from "./QuizLoading";
import { QuizError } from "./QuizError";
import { QuizEmpty } from "./QuizEmpty";
import QuizContent from "./QuizContent";

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  quiz_questions: QuizQuestion[];
}

export const QuizContainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizId, setQuizId] = useState<string>("");

  const { data: quiz, isLoading: isLoadingQuiz, error: quizError } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      if (!id) throw new Error("Quiz ID is required");
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (userId) {
        const { data: savedProgress } = await supabase
          .from('quiz_responses')
          .select('*')
          .eq('quiz_id', id)
          .eq('student_id', userId)
          .is('completed_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (savedProgress) {
          toast({
            title: "Quiz Progress Restored",
            description: "Your previous quiz progress has been loaded.",
          });
        }
      }
      
      console.log("Fetching quiz data for ID:", id);
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions (
            id,
            question,
            options,
            correct_answer,
            topic,
            points,
            difficulty,
            explanation
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching quiz:", error);
        throw error;
      }
      
      if (!data || !data.quiz_questions || data.quiz_questions.length === 0) {
        console.error("No questions found for quiz:", id);
        throw new Error("No questions found for this quiz");
      }
      
      console.log("Quiz data fetched successfully:", data);
      return data as Quiz;
    },
  });

  useEffect(() => {
    if (quiz && quiz.quiz_questions && quiz.quiz_questions.length > 0) {
      console.log("Setting quiz questions:", quiz.quiz_questions);
      setQuizQuestions(quiz.quiz_questions);
      setQuizId(quiz.id);
    }
  }, [quiz]);

  if (quizError) {
    console.error("Quiz error:", quizError);
    return <QuizError error={quizError} />;
  }

  if (isLoadingQuiz) {
    return <QuizLoading />;
  }

  if (!quiz || !quiz.quiz_questions || quiz.quiz_questions.length === 0) {
    console.error("Quiz empty state triggered");
    return <QuizEmpty />;
  }

  return (
    <QuizContent 
      quizId={quizId}
      quiz={quiz}
      questions={quizQuestions}
      onQuizSubmitted={() => setQuizSubmitted(true)}
    />
  );
};
