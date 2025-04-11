
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

interface QuizProgress {
  current_question_index: number;
  selected_answers: Record<number, string>;
  time_remaining: number | null;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [savedProgress, setSavedProgress] = useState<QuizProgress | null>(null);

  const { data: quiz, isLoading: isLoadingQuiz, error: quizError } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      if (!id) throw new Error("Quiz ID is required");
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (userId) {
        // Check for saved progress in quiz_progress table
        const { data: progress, error: progressError } = await supabase
          .from('quiz_progress')
          .select('*')
          .eq('quiz_id', id)
          .eq('student_id', userId)
          .maybeSingle();
          
        if (progress) {
          console.log("Found saved progress:", progress);
          setSavedProgress({
            current_question_index: progress.current_question_index,
            selected_answers: progress.selected_answers,
            time_remaining: progress.time_remaining
          });
          
          // Show resume dialog instead of start dialog
          setShowStartDialog(false);
          setShowResumeDialog(true);
        } else {
          // Check for in-progress quiz responses as fallback
          const { data: savedResponse } = await supabase
            .from('quiz_responses')
            .select('*')
            .eq('quiz_id', id)
            .eq('student_id', userId)
            .is('completed_at', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
              
          if (savedResponse) {
            toast({
              title: "Quiz Progress Found",
              description: "Your previous quiz progress has been loaded.",
            });
            // If there's saved progress, we can skip the start dialog
            setShowStartDialog(false);
            setQuizStarted(true);
          }
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

  // Save progress to Supabase when user exits the quiz
  const saveProgress = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId || !quizId) {
        console.error("Cannot save progress: Missing user ID or quiz ID");
        return;
      }
      
      // Only save if there's actual progress (at least one answer)
      if (Object.keys(selectedAnswers).length === 0) {
        console.log("No answers to save, skipping progress save");
        return;
      }
      
      console.log("Saving quiz progress...");
      const progressData = {
        quiz_id: quizId,
        student_id: userId,
        current_question_index: currentQuestionIndex,
        selected_answers: selectedAnswers,
        time_remaining: timeRemaining
      };
      
      const { error } = await supabase
        .from('quiz_progress')
        .upsert(progressData, { onConflict: 'quiz_id,student_id' });
        
      if (error) {
        console.error("Error saving quiz progress:", error);
        throw error;
      }
      
      console.log("Progress saved successfully");
      
    } catch (error) {
      console.error("Failed to save progress:", error);
      toast({
        title: "Failed to Save Progress",
        description: "We couldn't save your quiz progress. You may lose your current progress.",
        variant: "destructive",
      });
    }
  };

  // Delete saved progress
  const deleteSavedProgress = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId || !quizId) return;
      
      const { error } = await supabase
        .from('quiz_progress')
        .delete()
        .eq('quiz_id', quizId)
        .eq('student_id', userId);
        
      if (error) {
        console.error("Error deleting saved progress:", error);
      }
    } catch (error) {
      console.error("Failed to delete saved progress:", error);
    }
  };

  const handleStartQuiz = () => {
    setShowStartDialog(false);
    setQuizStarted(true);
    // Set the initial time remaining when the quiz starts
    if (quiz && quiz.duration_minutes) {
      console.log(`Setting timer to ${quiz.duration_minutes} minutes`);
      setTimeRemaining(quiz.duration_minutes * 60);
    }
  };

  const handleResumeQuiz = () => {
    if (!savedProgress) return;
    
    setCurrentQuestionIndex(savedProgress.current_question_index);
    setSelectedAnswers(savedProgress.selected_answers);
    
    // Restore time remaining if available
    if (savedProgress.time_remaining) {
      setTimeRemaining(savedProgress.time_remaining);
    } else if (quiz && quiz.duration_minutes) {
      setTimeRemaining(quiz.duration_minutes * 60);
    }
    
    setShowResumeDialog(false);
    setQuizStarted(true);
    
    toast({
      title: "Quiz Resumed",
      description: "Your previous progress has been restored.",
    });
  };

  const handleRestartQuiz = async () => {
    // Delete saved progress
    await deleteSavedProgress();
    
    // Reset state
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    
    // Set fresh timer
    if (quiz && quiz.duration_minutes) {
      setTimeRemaining(quiz.duration_minutes * 60);
    }
    
    setShowResumeDialog(false);
    setQuizStarted(true);
    
    toast({
      title: "Quiz Restarted",
      description: "You've started a fresh attempt at this quiz.",
    });
  };
  
  const handleExitQuiz = () => {
    // Save progress before exiting
    saveProgress();
    navigate('/quizzes');
  };
  
  const handleQuizSubmitted = () => {
    // Delete saved progress after successful submission
    deleteSavedProgress();
    setQuizSubmitted(true);
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
        onOpenChange={setShowResumeDialog}
        onResume={handleResumeQuiz}
        onRestart={handleRestartQuiz}
        onClose={() => navigate('/quizzes')}
        quizTitle={quiz.title}
        progress={savedProgress?.current_question_index || 0}
      />
      
      {(quizStarted || !showStartDialog) && !showResumeDialog && (
        <QuizContent 
          quizId={quizId}
          quiz={quiz}
          questions={quizQuestions}
          timeRemaining={timeRemaining}
          setTimeRemaining={setTimeRemaining}
          onQuizSubmitted={handleQuizSubmitted}
          onExitQuiz={handleExitQuiz}
          initialQuestionIndex={currentQuestionIndex}
          initialSelectedAnswers={selectedAnswers}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setSelectedAnswers={setSelectedAnswers}
          onSaveProgress={saveProgress}
        />
      )}
    </>
  );
};
