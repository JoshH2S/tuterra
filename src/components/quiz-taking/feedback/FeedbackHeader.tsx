
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackHeaderProps {
  isCorrect: boolean;
  userAnswerText: string;
  correctAnswerText: string;
}

export function FeedbackHeader({ 
  isCorrect, 
  userAnswerText, 
  correctAnswerText 
}: FeedbackHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 pt-1">
        {isCorrect ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      
      <div className="flex-1">
        <h3 className={cn(
          "text-lg font-medium",
          isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
        )}>
          {isCorrect ? "Correct!" : "Incorrect"}
        </h3>
        
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          {isCorrect 
            ? `Great job! You selected "${userAnswerText}", which is correct.` 
            : `You selected "${userAnswerText}". The correct answer was: "${correctAnswerText}"`
          }
        </p>
      </div>
    </div>
  );
}
