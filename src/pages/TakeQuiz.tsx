
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CardContent } from "@/components/ui/card";
import { useQuizTimer } from "@/hooks/quiz/useQuizTimer";
import { QuizQuestionCard } from "@/components/quiz-taking/QuizQuestionCard";
import { QuizNavigation } from "@/components/quiz-taking/QuizNavigation";
import { QuizSubmitButton } from "@/components/quiz-taking/QuizSubmitButton";
import { useQuizTaking } from "@/hooks/quiz/useQuizTaking";

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
  
  const handleTimeEnd = () => {
    toast({
      title: "Time's up!",
      description: "Your quiz time has ended. Submitting your answers now.",
      variant: "destructive",
    });
    // We'll call handleSubmit from the hook after quiz is loaded
  };

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', id],
    queryFn: async () => {
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

      if (error) throw error;
      return data as Quiz;
    },
  });

  // Initialize timer once quiz data is loaded
  const { timeRemaining } = useQuizTimer(
    quiz?.duration_minutes || 0, 
    handleTimeEnd
  );

  // Format remaining time for display
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "No time limit";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoadingQuiz) {
    return <div className="container mx-auto py-10 px-4 sm:px-6">Loading quiz...</div>;
  }

  if (!quiz || !quiz.quiz_questions || quiz.quiz_questions.length === 0) {
    return <div className="container mx-auto py-10 px-4 sm:px-6">Quiz not found or no questions available.</div>;
  }

  // Use the custom hook for quiz taking
  const {
    currentQuestion,
    selectedAnswers,
    isSubmitting,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmit
  } = useQuizTaking(quiz.id, quiz.quiz_questions);

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
      
      <div className="max-w-2xl mx-auto mt-4">
        <CardContent className="space-y-4">
          <div className="text-right text-sm font-medium text-gray-500">
            Time remaining: {formatTime(timeRemaining)}
          </div>
          
          <div className="flex justify-between mt-6">
            <QuizNavigation
              currentQuestion={currentQuestion}
              totalQuestions={questions.length}
              onNext={handleNextQuestion}
              onPrevious={handlePreviousQuestion}
            />
            
            {currentQuestion === questions.length - 1 && (
              <QuizSubmitButton
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
              />
            )}
          </div>
          
          {currentQuestion === questions.length - 1 && (
            <QuizSubmitButton
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              isLastQuestion={true}
            />
          )}
        </CardContent>
      </div>
    </div>
  );
};

export default TakeQuiz;
