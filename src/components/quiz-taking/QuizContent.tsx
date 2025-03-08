
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { QuizNavigationLinks } from "@/components/quiz-generation/QuizNavigationLinks";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizNavigation } from "./QuizNavigation";
import { QuizSubmitButton } from "./QuizSubmitButton";
import { QuizHeader } from "./QuizHeader";
import { QuizExitDialog } from "./QuizExitDialog";
import { QuizTimer } from "./QuizTimer";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  const answeredQuestionsCount = Object.keys(selectedAnswers).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Persistent navigation links */}
        <QuizNavigationLinks />
        
        <Card className="max-w-4xl mx-auto mt-6 p-6">
          <QuizHeader 
            title={quiz.title} 
            timeRemaining={timeRemaining}
            onTimeUp={handleSubmitQuiz}
          />
          
          <div className="text-center my-4">
            <p className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          
          <QuizQuestionCard
            question={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            onAnswerSelect={handleSelectAnswer}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
            showFeedback={false}
            explanations={{}}
            isGeneratingExplanation={false}
            timeRemaining={timeRemaining}
            answeredQuestions={Object.keys(selectedAnswers).map(key => parseInt(key))}
          />
          
          <QuizNavigation
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
          />
          
          <div className="mt-8 flex justify-end">
            <QuizSubmitButton
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitQuiz}
              isLastQuestion={isLastQuestion}
            />
          </div>
        </Card>
      </div>
      
      <QuizExitDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirmExit={() => navigate('/quizzes')}
      />
    </div>
  );
};

export default QuizContent;
