import React, { useState, useEffect } from "react";
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
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

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
  initialQuestionIndex?: number;
  initialSelectedAnswers?: Record<number, string>;
  setCurrentQuestionIndex?: React.Dispatch<React.SetStateAction<number>>;
  setSelectedAnswers?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onSaveProgress?: () => Promise<void>;
}

const QuizContent: React.FC<QuizContentProps> = ({ 
  quizId, 
  quiz, 
  questions, 
  timeRemaining,
  setTimeRemaining,
  onQuizSubmitted,
  onExitQuiz,
  initialQuestionIndex = 0,
  initialSelectedAnswers = {},
  setCurrentQuestionIndex,
  setSelectedAnswers,
  onSaveProgress
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndexLocal] = useState(initialQuestionIndex);
  const [selectedAnswers, setSelectedAnswersLocal] = useState<Record<number, string>>(initialSelectedAnswers);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [validatingSubmission, setValidatingSubmission] = useState(false);
  
  const updateCurrentQuestionIndex = (index: number) => {
    setCurrentQuestionIndexLocal(index);
    if (setCurrentQuestionIndex) {
      setCurrentQuestionIndex(index);
    }
  };
  
  const updateSelectedAnswers = (answers: Record<number, string>) => {
    setSelectedAnswersLocal(answers);
    if (setSelectedAnswers) {
      setSelectedAnswers(answers);
    }
  };
  
  const { explanations, isGenerating, generateExplanation } = useExplanationGeneration();
  
  const { isSubmitting, handleSubmitQuiz } = useQuizSubmit({
    quizId,
    questions,
    onQuizSubmitted
  });
  
  useEffect(() => {
    if (!onSaveProgress) return;
    
    if (Object.keys(selectedAnswers).length === 0) return;
    
    const intervalId = setInterval(() => {
      console.log("Auto-saving quiz progress...");
      onSaveProgress();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [selectedAnswers, onSaveProgress]);
  
  const handleSelectAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQuestionIndex]: answer
    };
    
    updateSelectedAnswers(updatedAnswers);
    
    generateExplanation(currentQuestion, answer, isCorrect);
    
    setShowFeedback(true);
    
    if (onSaveProgress) {
      onSaveProgress();
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < questions.length - 1) {
      updateCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (isLastQuestion) {
      submitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex > 0) {
      updateCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleJumpToQuestion = (index: number) => {
    setShowFeedback(false);
    updateCurrentQuestionIndex(index);
  };
  
  const handleExitClick = async () => {
    if (onSaveProgress) {
      await onSaveProgress();
    }
    
    setShowExitDialog(true);
    setTimerActive(false);
  };
  
  const handleExitDialogClose = () => {
    setShowExitDialog(false);
    setTimerActive(true);
  };

  const validateSubmission = () => {
    setValidatingSubmission(true);
    
    if (Object.keys(selectedAnswers).length === 0) {
      toast({
        title: "Cannot submit quiz",
        description: "Please answer at least one question before submitting.",
        variant: "destructive",
      });
      setValidatingSubmission(false);
      return false;
    }
    
    setValidatingSubmission(false);
    return true;
  };

  const submitQuiz = () => {
    if (validateSubmission()) {
      handleSubmitQuiz(selectedAnswers);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading questions...</span>
      </div>
    );
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
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
        
        <div className="text-center my-4">
          <p className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {answeredQuestionsCount} of {questions.length} questions answered
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
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md shadow-sm transition-colors"
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8">
              <div className="text-sm text-muted-foreground">
                {answeredQuestionsCount === questions.length 
                  ? "All questions answered" 
                  : `${questions.length - answeredQuestionsCount} questions remaining`}
              </div>
              
              <QuizSubmitButton
                isSubmitting={isSubmitting || validatingSubmission}
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
