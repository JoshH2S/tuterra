
import React from "react";
import { CardContent } from "@/components/ui/card";
import { QuizNavigation } from "@/components/quiz-taking/QuizNavigation";
import { QuizSubmitButton } from "@/components/quiz-taking/QuizSubmitButton";
import { QuizTimerDisplay } from "@/components/quiz-taking/QuizTimerDisplay";

interface QuizControlsProps {
  currentQuestion: number;
  totalQuestions: number;
  isSubmitting: boolean;
  timeRemaining: number | null;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

export const QuizControls: React.FC<QuizControlsProps> = ({
  currentQuestion,
  totalQuestions,
  isSubmitting,
  timeRemaining,
  onNext,
  onPrevious,
  onSubmit,
}) => {
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <CardContent className="space-y-4">
        <QuizTimerDisplay timeRemaining={timeRemaining} />
        
        <div className="flex justify-between mt-6">
          <QuizNavigation
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            onNext={onNext}
            onPrevious={onPrevious}
          />
          
          {isLastQuestion && (
            <div className="hidden sm:block">
              <QuizSubmitButton
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
              />
            </div>
          )}
        </div>
        
        {/* Submit button for mobile view when on last question */}
        {isLastQuestion && (
          <div className="sm:hidden mt-4">
            <QuizSubmitButton
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
              isLastQuestion={true}
            />
          </div>
        )}
      </CardContent>
    </div>
  );
};
