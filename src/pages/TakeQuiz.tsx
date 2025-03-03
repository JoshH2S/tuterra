
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQuizTimer } from "@/hooks/quiz/useQuizTimer";
import { QuizQuestionCard } from "@/components/quiz-taking/QuizQuestionCard";
import { useQuizTaking } from "@/hooks/quiz/useQuizTaking";
import { useState, useEffect } from "react";
import { QuizLoading } from "@/components/quiz-taking/QuizLoading";
import { QuizError } from "@/components/quiz-taking/QuizError";
import { QuizEmpty } from "@/components/quiz-taking/QuizEmpty";
import { QuizControls } from "@/components/quiz-taking/QuizControls";

interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  topic: string;
  points: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
}

interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  quiz_questions: QuizQuestion[];
}

const TakeQuiz = () => {
  const { id } = useParams();
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizId, setQuizId] = useState<string>("");
  
  const { data: quiz, isLoading: isLoadingQuiz, error: quizError } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
      if (!id) throw new Error("Quiz ID is required");
      
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
            difficulty
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
      
      return data as Quiz;
    },
  });

  // Update the state variables once quiz data is loaded
  useEffect(() => {
    if (quiz && quiz.quiz_questions && quiz.quiz_questions.length > 0) {
      setQuizQuestions(quiz.quiz_questions);
      setQuizId(quiz.id);
    }
  }, [quiz]);

  const handleTimeEnd = () => {
    if (quizSubmitted) return;
    
    toast({
      title: "Time's up!",
      description: "Your quiz time has ended. Submitting your answers now.",
      variant: "destructive",
    });
    
    // Only try to submit if we have the quiz loaded
    if (quiz && quizId) {
      handleSubmit();
    }
  };

  // Initialize timer once quiz data is loaded
  const { timeRemaining } = useQuizTimer(
    quiz?.duration_minutes || 0, 
    handleTimeEnd
  );

  // Use the custom hook for quiz taking
  const {
    currentQuestion,
    selectedAnswers,
    isSubmitting,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmit
  } = useQuizTaking(quizId, quizQuestions, () => setQuizSubmitted(true));

  // Handle various states
  if (quizError) {
    return <QuizError error={quizError} />;
  }

  if (isLoadingQuiz) {
    return <QuizLoading />;
  }

  if (!quiz || !quiz.quiz_questions || quiz.quiz_questions.length === 0) {
    return <QuizEmpty />;
  }

  const questions = quiz.quiz_questions;
  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <QuizQuestionCard
        question={currentQuestionData}
        currentIndex={currentQuestion}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswers[currentQuestion]}
        onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion, answer)}
      />
      
      <QuizControls
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        isSubmitting={isSubmitting}
        timeRemaining={timeRemaining}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default TakeQuiz;
