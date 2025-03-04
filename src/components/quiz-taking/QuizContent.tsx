
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQuizTimer } from "@/hooks/quiz/useQuizTimer";
import { useQuizTaking } from "@/hooks/quiz/useQuizTaking";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizControls } from "./QuizControls";

interface QuizContentProps {
  quizId: string;
  quiz: {
    id: string;
    title: string;
    duration_minutes: number;
    quiz_questions: QuizQuestion[];
  };
  questions: QuizQuestion[];
  onQuizSubmitted: () => void;
}

export const QuizContent = ({ quizId, quiz, questions, onQuizSubmitted }: QuizContentProps) => {
  const navigate = useNavigate();

  const handleTimeEnd = () => {
    toast({
      title: "Time's up!",
      description: "Your quiz time has ended. Submitting your answers now.",
      variant: "destructive",
    });
    
    if (quizId) {
      handleSubmit();
    }
  };

  const { timeRemaining } = useQuizTimer(
    quiz.duration_minutes || 0, 
    handleTimeEnd
  );

  const {
    currentQuestion,
    selectedAnswers,
    isSubmitting,
    showFeedback,
    explanations,
    isGeneratingExplanation,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmit
  } = useQuizTaking(quizId, questions, onQuizSubmitted);

  const handleExitQuiz = async () => {
    if (!quizId || !quiz) return;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (userId) {
        const { data: existingResponse } = await supabase
          .from('quiz_responses')
          .select('id')
          .eq('quiz_id', quizId)
          .eq('student_id', userId)
          .is('completed_at', null)
          .single();
          
        if (existingResponse) {
          await supabase
            .from('quiz_responses')
            .update({})
            .eq('id', existingResponse.id);
        } else {
          await supabase
            .from('quiz_responses')
            .insert([
              {
                quiz_id: quizId,
                student_id: userId,
                start_time: new Date().toISOString(),
                total_questions: questions.length
              }
            ]);
        }
        
        toast({
          title: "Progress Saved",
          description: "Your quiz progress has been saved. You can resume later.",
        });
        
        navigate('/quizzes');
      }
    } catch (error) {
      console.error("Error saving quiz progress:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz progress.",
        variant: "destructive",
      });
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const currentSelectedAnswer = selectedAnswers[currentQuestion];

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <QuizQuestionCard
        question={currentQuestionData}
        currentIndex={currentQuestion}
        totalQuestions={questions.length}
        selectedAnswer={currentSelectedAnswer}
        onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion, answer)}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        showFeedback={showFeedback}
        explanations={explanations}
        isGeneratingExplanation={isGeneratingExplanation}
      />
      
      <QuizControls
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        isSubmitting={isSubmitting}
        timeRemaining={timeRemaining}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        onSubmit={handleSubmit}
        onExit={handleExitQuiz}
      />
    </div>
  );
};
