
import { Info, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface QuizAnswerFeedbackProps {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  isLoading?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export const QuizAnswerFeedback = ({
  question,
  userAnswer,
  isCorrect,
  explanation,
  isLoading = false,
  expanded = false,
  onToggle,
}: QuizAnswerFeedbackProps) => {
  const [showFullExplanation, setShowFullExplanation] = useState(expanded);
  
  // Reset state when expanded prop changes
  useEffect(() => {
    setShowFullExplanation(expanded);
  }, [expanded]);

  // Get the correct answer text from the question options
  const correctAnswerText = question.options[question.correct_answer] || '';
  // Get the user's selected answer text
  const userAnswerText = question.options[userAnswer] || '';
  
  // Check if explanation is long enough to need expansion
  const isLongExplanation = explanation ? explanation.length > 120 : false;
  
  // Handle toggle internally if no external handler is provided
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setShowFullExplanation(!showFullExplanation);
    }
  };

  return (
    <Alert 
      className={cn(
        "border-l-4 shadow-sm", 
        isCorrect 
          ? "bg-green-50 border-green-500 dark:bg-green-900/10 dark:border-green-600" 
          : "bg-red-50 border-red-500 dark:bg-red-900/10 dark:border-red-600"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-1">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        
        <div className="flex-1">
          <AlertTitle className={cn(
            "text-lg font-medium",
            isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
          )}>
            {isCorrect ? "Correct!" : "Incorrect"}
          </AlertTitle>
          
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-gray-700 dark:text-gray-300">
              {isCorrect 
                ? `Great job! You selected "${userAnswerText}", which is correct.` 
                : `You selected "${userAnswerText}". The correct answer was: "${correctAnswerText}"`
              }
            </p>
            
            <div className="mt-2">
              {isLoading ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Info className="h-4 w-4 text-blue-500" /> 
                    <p className="font-semibold text-blue-600 dark:text-blue-400">Generating explanation...</p>
                  </div>
                  <div className="h-2 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700 w-full"></div>
                </div>
              ) : explanation ? (
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  !showFullExplanation && isLongExplanation && "max-h-24"
                )}>
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold flex items-center gap-1 mb-1 text-blue-700 dark:text-blue-400">
                      <Info className="h-4 w-4" /> Explanation:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{explanation}</p>
                    
                    {isLongExplanation && (
                      <button 
                        onClick={handleToggle}
                        className="mt-2 text-xs text-primary hover:underline focus:outline-none flex items-center gap-1"
                        aria-label={showFullExplanation ? "Show less" : "Show more"}
                      >
                        {showFullExplanation ? "Show less" : "Show more"}
                        {showFullExplanation ? 
                          <ChevronUp className="h-3 w-3" /> : 
                          <ChevronDown className="h-3 w-3" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm italic text-gray-500 dark:text-gray-400">
                  <Info className="h-4 w-4" /> 
                  <p>No explanation available for this question.</p>
                </div>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};
