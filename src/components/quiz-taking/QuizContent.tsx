
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
import { useExplanationGeneration } from "@/hooks/quiz/useExplanationGeneration";

interface QuizContentProps {
  quizId: string;
  quiz: {
    id: string;
    title: string;
    duration_minutes: number;
  };
  questions: QuizQuestion[];
  timeRemaining: number | null;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number | null>>;
  onQuizSubmitted: () => void;
  onExitQuiz: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({ 
  quizId, 
  quiz, 
  questions, 
  timeRemaining,
  setTimeRemaining,
  onQuizSubmitted,
  onExitQuiz
}) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const { explanations, isGenerating, generateExplanation } = useExplanationGeneration();
  
  const { isSubmitting, handleSubmitQuiz } = useQuizSubmit(
    quizId,
    questions,
    onQuizSubmitted
  );
  
  const handleSelectAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    
    // Store the answer
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
    
    // Generate explanation for this answer
    generateExplanation(currentQuestion, answer, isCorrect);
    
    // Show feedback
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (isLastQuestion) {
      // If on the last question and user clicks Next after seeing feedback, submit the quiz
      submitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleJumpToQuestion = (index: number) => {
    setShowFeedback(false);
    setCurrentQuestionIndex(index);
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
          onJumpToQuestion={handleJumpToQuestion}
          showFeedback={showFeedback}
          explanations={explanations}
          isGeneratingExplanation={isGenerating}
          timeRemaining={timeRemaining}
          answeredQuestions={Object.keys(selectedAnswers).map(key => parseInt(key))}
        />
        
        {showFeedback && (
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleNextQuestion} 
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md shadow"
            >
              {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </button>
          </div>
        )}
        
        {!showFeedback && (
          <>
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
          </>
        )}
        
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
