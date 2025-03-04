
import { Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuizAnswerFeedbackProps {
  isCorrect: boolean;
  correctAnswerText: string;
  explanation?: string;
  isLoadingExplanation?: boolean;
}

export const QuizAnswerFeedback = ({
  isCorrect,
  correctAnswerText,
  explanation,
  isLoadingExplanation = false,
}: QuizAnswerFeedbackProps) => {
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
          {isLoadingExplanation ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <Info className="h-4 w-4" /> 
                <p className="font-semibold">Generating explanation...</p>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full animate-pulse"></div>
            </div>
          ) : explanation ? (
            <div>
              <p className="font-semibold flex items-center gap-1">
                <Info className="h-4 w-4" /> Explanation:
              </p>
              <p className="text-sm mt-1">{explanation}</p>
            </div>
          ) : null}
        </div>
      </AlertDescription>
    </Alert>
  );
};
