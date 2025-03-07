
import { Info, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";

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
  // Get the correct answer text from the question options
  const correctAnswerText = question.options[question.correct_answer] || '';

  return (
    <Alert className={isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
      {isCorrect ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <AlertTitle className={isCorrect ? "text-green-700" : "text-red-700"}>
        {isCorrect ? "Correct!" : "Incorrect"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {isCorrect 
          ? "Great job! You selected the correct answer." 
          : `The correct answer was: ${correctAnswerText}`
        }
        
        <div className="mt-2">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <Info className="h-4 w-4" /> 
                <p className="font-semibold">Generating explanation...</p>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full animate-pulse"></div>
            </div>
          ) : explanation ? (
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-none' : 'max-h-24'}`}>
              <p className="font-semibold flex items-center gap-1">
                <Info className="h-4 w-4" /> Explanation:
              </p>
              <p className="text-sm mt-1">{explanation}</p>
              
              {explanation.length > 120 && (
                <button 
                  onClick={onToggle}
                  className="mt-2 text-xs text-primary hover:underline focus:outline-none"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </AlertDescription>
    </Alert>
  );
};
