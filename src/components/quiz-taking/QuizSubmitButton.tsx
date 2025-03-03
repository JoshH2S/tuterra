
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface QuizSubmitButtonProps {
  isSubmitting: boolean;
  onSubmit: () => void;
  isLastQuestion?: boolean;
}

export const QuizSubmitButton: React.FC<QuizSubmitButtonProps> = ({
  isSubmitting,
  onSubmit,
  isLastQuestion = false,
}) => {
  const buttonText = isLastQuestion ? "Submit Quiz" : "Finish Quiz";
  
  return (
    <Button 
      onClick={onSubmit}
      disabled={isSubmitting}
      className="bg-primary hover:bg-primary-dark text-white transition-colors" 
      size={isLastQuestion ? "default" : "lg"}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
};
