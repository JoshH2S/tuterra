import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizNavigation } from "./QuizNavigation";
import { QuizSubmitButton } from "./QuizSubmitButton";
import { QuizHeader } from "./QuizHeader";
import { QuizExitDialog } from "./QuizExitDialog";
import { QuizFooter } from "./QuizFooter";
import { QuizContentWrapper } from "./QuizContentWrapper";
import { useQuizSubmit } from "@/hooks/quiz/useQuizSubmit";

interface QuizContentProps {
  quizId: string;
  quiz: {
    id: string;
    title: string;
    duration_minutes: number;
  };
  questions: QuizQuestion[];
  onQuizSubmitted: () => void;
  onExitQuiz: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({ 
  quizId, 
  quiz, 
  questions, 
  onQuizSubmitted,
  onExitQuiz
}) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(quiz.duration_minutes * 60);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  
  const { isSubmitting, handleSubmitQuiz } = useQuizSubmit(
    quizId,
    questions,
    onQuizSubmitted
  );
  
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
  
  const handleExitClick = () => {
    setShowExitDialog(true);
    setTimerActive(false); // Pause timer while dialog is open
  };
  
  const handleExitDialogClose = () => {
    setShowExitDialog(false);
    setTimerActive(true); // Resume timer when dialog is closed
  };

  const submitQuiz = () => {
    handleSubmitQuiz(selectedAnswers);
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div>Question not found</div>;
  }

  const answeredQuestionsCount = Object.keys(selectedAnswers).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <>
      <QuizContentWrapper onExitClick={handleExitClick}>
        <QuizHeader 
          title={quiz.title} 
          timeRemaining={timeRemaining}
          onTimeUp={submitQuiz}
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
            onSubmit={submitQuiz}
            isLastQuestion={isLastQuestion}
          />
        </div>
        
        <QuizFooter />
      </QuizContentWrapper>
      
      <QuizExitDialog
        open={showExitDialog}
        onClose={handleExitDialogClose}
        onConfirmExit={onExitQuiz}
      />
    </>
  );
};

export default QuizContent;
