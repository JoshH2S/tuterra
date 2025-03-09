
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuizQuestion } from "@/hooks/quiz/quizTypes";
import { cn } from "@/lib/utils";
import { FeedbackHeader } from "./feedback/FeedbackHeader";
import { FeedbackExplanation } from "./feedback/FeedbackExplanation";

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
  // Get the user's selected answer text
  const userAnswerText = question.options[userAnswer] || '';

  return (
    <Alert 
      className={cn(
        "border-l-4 shadow-sm", 
        isCorrect 
          ? "bg-green-50 border-green-500 dark:bg-green-900/10 dark:border-green-600" 
          : "bg-red-50 border-red-500 dark:bg-red-900/10 dark:border-red-600"
      )}
    >
      <FeedbackHeader 
        isCorrect={isCorrect}
        userAnswerText={userAnswerText}
        correctAnswerText={correctAnswerText}
      />
      
      <AlertDescription className="mt-3 space-y-3">
        <div className="mt-2">
          <FeedbackExplanation
            explanation={explanation}
            isLoading={isLoading}
            expanded={expanded}
            onToggle={onToggle || (() => {})}
          />
        </div>
      </AlertDescription>
    </Alert>
  );
};
