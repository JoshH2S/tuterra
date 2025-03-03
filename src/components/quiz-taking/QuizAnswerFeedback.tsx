
import { Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuizAnswerFeedbackProps {
  isCorrect: boolean;
  correctAnswerText: string;
  explanation?: string;
}

export const QuizAnswerFeedback = ({
  isCorrect,
  correctAnswerText,
  explanation,
}: QuizAnswerFeedbackProps) => {
  return (
    <Alert className={isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
      <AlertCircle className={`h-4 w-4 ${isCorrect ? "text-green-500" : "text-red-500"}`} />
      <AlertTitle className={isCorrect ? "text-green-700" : "text-red-700"}>
        {isCorrect ? "Correct!" : "Incorrect"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {isCorrect 
          ? "Great job! You selected the correct answer." 
          : `The correct answer was: ${correctAnswerText}`
        }
        {explanation && (
          <div className="mt-2">
            <p className="font-semibold flex items-center gap-1">
              <Info className="h-4 w-4" /> Explanation:
            </p>
            <p className="text-sm mt-1">{explanation}</p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};
