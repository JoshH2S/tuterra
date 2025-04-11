
import React, { useState, useEffect } from "react";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizHeader } from "./QuizHeader";
import { QuizExitDialog } from "./QuizExitDialog";
import { QuizContentWrapper } from "./QuizContentWrapper";
import { useQuizSubmit } from "@/hooks/quiz/useQuizSubmit";
import { useExplanationGeneration } from "@/hooks/quiz/useExplanationGeneration";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  // Use either the prop setters or local state setters
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
  
  // Use the updated useQuizSubmit hook with object parameter
  const { isSubmitting, handleSubmitQuiz } = useQuizSubmit({
    quizId,
    questions,
    onQuizSubmitted
  });
  
  // Set up an interval to save progress periodically
  useEffect(() => {
    if (!onSaveProgress) return;
    
    // Only save if there are selected answers
    if (Object.keys(selectedAnswers).length === 0) return;
    
    const intervalId = setInterval(() => {
      console.log("Auto-saving quiz progress...");
      onSaveProgress();
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [selectedAnswers, onSaveProgress]);
  
  const handleSelectAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    
    // Store the answer
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQuestionIndex]: answer
    };
    
    updateSelectedAnswers(updatedAnswers);
    
    // Generate explanation for this answer
    generateExplanation(currentQuestion, answer, isCorrect);
    
    // Auto-navigate to next question after answer if not on last question
    if (currentQuestionIndex < questions.length - 1 && !showFeedback) {
      // Give a slight delay to show the selection before moving
      setTimeout(() => {
        updateCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else if (currentQuestionIndex === questions.length - 1) {
      // On the last question, show a toast suggesting to submit
      toast({
        title: "All questions answered",
        description: "You can now submit the quiz or review your answers.",
        duration: 3000,
      });
    }
    
    // Save progress after selecting an answer
    if (onSaveProgress) {
      onSaveProgress();
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    if (currentQuestionIndex < questions.length - 1) {
      updateCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (isLastQuestion) {
      // If on the last question and user clicks Next after seeing feedback, submit the quiz
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
    // Save progress before showing exit dialog
    if (onSaveProgress) {
      await onSaveProgress();
    }
    
    setShowExitDialog(true);
    setTimerActive(false); // Pause timer while dialog is open
  };
  
  const handleExitDialogClose = () => {
    setShowExitDialog(false);
    setTimerActive(true); // Resume timer when dialog is closed
  };

  const validateSubmission = () => {
    setValidatingSubmission(true);
    
    // Check if the user has answered at least one question
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
        <div className="max-w-3xl mx-auto px-4 py-6">
          <QuizHeader 
            title={quiz.title} 
            timeRemaining={timeRemaining}
            onTimeUp={submitQuiz}
          />
          
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
          
          {/* Submit button at the bottom */}
          <div className="mt-10 flex justify-center">
            <Button
              className="px-8 py-2"
              onClick={submitQuiz}
              disabled={answeredQuestionsCount === 0 || isSubmitting || validatingSubmission}
            >
              {isSubmitting || validatingSubmission ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          </div>
        </div>
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
