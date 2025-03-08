
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { QuizNavigationLinks } from "@/components/quiz-generation/QuizNavigationLinks";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizTimer } from "./QuizTimer";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizNavigation } from "./QuizNavigation";
import { QuizSubmitButton } from "./QuizSubmitButton";
import { QuizHeader } from "./QuizHeader";
import { QuizExitDialog } from "./QuizExitDialog";

interface QuizContentProps {
  quizId: string;
  quiz: {
    id: string;
    title: string;
    duration_minutes: number;
  };
  questions: QuizQuestion[];
  onQuizSubmitted: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({ 
  quizId, 
  quiz, 
  questions, 
  onQuizSubmitted 
}) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(quiz.duration_minutes * 60);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a quiz",
          variant: "destructive",
        });
        return;
      }
      
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      
      questions.forEach((question, index) => {
        const selectedAnswer = selectedAnswers[index];
        if (selectedAnswer === question.correct_answer) {
          correctAnswers++;
          totalPoints += question.points || 1;
        }
      });
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      // Create quiz response
      const { data: response, error } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: quizId,
          student_id: userId,
          score,
          answers: selectedAnswers,
          completed_at: new Date().toISOString(),
          total_questions: questions.length,
          correct_answers: correctAnswers,
          total_points: totalPoints
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Quiz Submitted",
        description: `Your score: ${score}%`,
      });
      
      onQuizSubmitted();
      navigate(`/quiz-results/${response.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Persistent navigation links */}
        <QuizNavigationLinks />
        
        <Card className="max-w-4xl mx-auto mt-6 p-6">
          <QuizHeader 
            title={quiz.title} 
            currentQuestion={currentQuestionIndex + 1} 
            totalQuestions={questions.length}
            onExit={() => setShowExitDialog(true)}
          />
          
          <QuizTimer 
            initialTime={quiz.duration_minutes * 60}
            onTimeUpdate={setTimeRemaining}
            onTimeExpired={handleSubmitQuiz}
          />
          
          <QuizQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            onSelectAnswer={handleSelectAnswer}
          />
          
          <QuizNavigation
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            canGoPrevious={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < questions.length - 1}
            onPrevious={handlePreviousQuestion}
            onNext={handleNextQuestion}
          />
          
          <QuizSubmitButton 
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            timeRemaining={timeRemaining}
            answeredQuestions={Object.keys(selectedAnswers).length}
            onSubmit={handleSubmitQuiz}
          />
        </Card>
      </div>
      
      <QuizExitDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={() => navigate('/quizzes')}
      />
    </div>
  );
};

export default QuizContent;
