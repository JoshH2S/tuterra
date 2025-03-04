
import React from "react";
import { CardContent } from "@/components/ui/card";
import { QuizNavigation } from "@/components/quiz-taking/QuizNavigation";
import { QuizSubmitButton } from "@/components/quiz-taking/QuizSubmitButton";
import { QuizTimerDisplay } from "@/components/quiz-taking/QuizTimerDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ExitIcon } from "lucide-react";
import { useState } from "react";
import { QuizExitDialog } from "@/components/quiz-taking/QuizExitDialog";

interface QuizControlsProps {
  currentQuestion: number;
  totalQuestions: number;
  isSubmitting: boolean;
  timeRemaining: number | null;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onExit: () => void;
}

export const QuizControls: React.FC<QuizControlsProps> = ({
  currentQuestion,
  totalQuestions,
  isSubmitting,
  timeRemaining,
  onNext,
  onPrevious,
  onSubmit,
  onExit,
}) => {
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const isMobile = useIsMobile();
  const [showExitDialog, setShowExitDialog] = useState(false);

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <CardContent className="space-y-4">
        <QuizTimerDisplay timeRemaining={timeRemaining} />
        
        <div className="flex flex-wrap items-center justify-between gap-2 mt-6">
          <QuizNavigation
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            onNext={onNext}
            onPrevious={onPrevious}
          />
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowExitDialog(true)}
              className="text-gray-600 hover:text-red-600"
              size={isMobile ? "sm" : "default"}
            >
              <ExitIcon className="w-4 h-4 mr-1" />
              {isMobile ? "Exit" : "Exit & Save"}
            </Button>
            
            {isLastQuestion && (
              <div className="hidden sm:block">
                <QuizSubmitButton
                  isSubmitting={isSubmitting}
                  onSubmit={onSubmit}
                />
              </div>
            )}
          </div>
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
      
      <QuizExitDialog 
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirmExit={onExit}
      />
    </div>
  );
};
