
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

  // Handle error states properly
  if (quizError) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-red-50 p-4 rounded-md border border-red-200">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error Loading Quiz</h2>
          <p className="text-sm text-red-600">{quizError instanceof Error ? quizError.message : "Unknown error occurred"}</p>
          <p className="text-sm text-gray-600 mt-4">Please try again later or contact support if this problem persists.</p>
        </div>
      </div>
    );
  }

  if (isLoadingQuiz) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.quiz_questions || quiz.quiz_questions.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-700 mb-2">Quiz Not Available</h2>
          <p className="text-sm text-yellow-600">This quiz has no questions or is not available.</p>
        </div>
      </div>
    );
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
          
          {/* Submit button for mobile view when on last question */}
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
