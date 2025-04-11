
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizLoading } from "./QuizLoading";
import { QuizError } from "./QuizError";
import { QuizEmpty } from "./QuizEmpty";
import QuizContent from "./QuizContent";
import { QuizStartDialog } from "./QuizStartDialog";
import { ResumeQuizDialog } from "./ResumeQuizDialog";

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
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [savedProgress, setSavedProgress] = useState<Record<number, string> | null>(null);

  const { data: quiz, isLoading: isLoadingQuiz, error: quizError } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      if (!id) throw new Error("Quiz ID is required");
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      // Check localStorage for saved progress
      const localStorageProgress = localStorage.getItem(`quiz_progress_${id}`);
      if (localStorageProgress) {
        try {
          const parsedProgress = JSON.parse(localStorageProgress);
          setSavedProgress(parsedProgress);
          // If there's saved progress, we'll show the resume dialog instead of start dialog
          setShowStartDialog(false);
          setShowResumeDialog(true);
        } catch (error) {
          console.error("Error parsing saved quiz progress:", error);
        }
      }
      
      if (userId) {
        const { data: savedProgressFromDB } = await supabase
          .from('quiz_responses')
          .select('*')
          .eq('quiz_id', id)
          .eq('student_id', userId)
          .is('completed_at', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (savedProgressFromDB && !localStorageProgress) {
          toast({
            title: "Quiz Progress Found",
            description: "You have an unfinished attempt for this quiz.",
          });
          // If there's saved progress, we'll show the resume dialog instead of start dialog
          setShowStartDialog(false);
          setShowResumeDialog(true);
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

  const handleStartQuiz = () => {
    setShowStartDialog(false);
    setShowResumeDialog(false);
    setQuizStarted(true);
    // Set the initial time remaining when the quiz starts
    if (quiz && quiz.duration_minutes) {
      console.log(`Setting timer to ${quiz.duration_minutes} minutes`);
      setTimeRemaining(quiz.duration_minutes * 60);
    }
    // Clear any saved progress when starting fresh
    localStorage.removeItem(`quiz_progress_${id}`);
    setSavedProgress(null);
  };
  
  const handleResumeQuiz = () => {
    setShowResumeDialog(false);
    setQuizStarted(true);
    // Set the timer - we could calculate remaining time here if needed
    if (quiz && quiz.duration_minutes) {
      setTimeRemaining(quiz.duration_minutes * 60);
    }
  };

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
    <>
      <QuizStartDialog 
        open={showStartDialog} 
        onClose={() => {
          // If user closes dialog without starting, redirect to quizzes
          if (!quizStarted) {
            navigate('/quizzes');
          } else {
            setShowStartDialog(false);
          }
        }}
        onStart={handleStartQuiz}
      />
      
      <ResumeQuizDialog
        open={showResumeDialog}
        onClose={() => {
          if (!quizStarted) {
            navigate('/quizzes');
          } else {
            setShowResumeDialog(false);
          }
        }}
        onResume={handleResumeQuiz}
        onRestart={handleStartQuiz}
        quizTitle={quiz.title}
      />
      
      {(quizStarted || !showStartDialog) && (
        <QuizContent 
          quizId={quizId}
          quiz={quiz}
          questions={quizQuestions}
          timeRemaining={timeRemaining}
          setTimeRemaining={setTimeRemaining}
          onQuizSubmitted={() => setQuizSubmitted(true)}
          onExitQuiz={() => navigate('/quizzes')}
          savedProgress={savedProgress}
        />
      )}
    </>
  );
};
