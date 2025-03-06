
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface InterviewResponseInputProps {
  onSubmit: (response: string) => void;
  isTyping: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  onComplete?: () => void;
}

export const InterviewResponseInput = ({ 
  onSubmit, 
  isTyping, 
  currentQuestionIndex,
  totalQuestions,
  onComplete 
}: InterviewResponseInputProps) => {
  const [userResponse, setUserResponse] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (userResponse.trim() && !isTyping) {
      console.log("Submitting user response:", userResponse.trim());
      onSubmit(userResponse);
      setUserResponse("");
      
      // Focus on textarea after submitting
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    } else if (!userResponse.trim()) {
      toast({
        title: "Empty response",
        description: "Please type your response before submitting.",
        variant: "destructive",
      });
    }
  };

  // Handle keyboard submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Calculate progress percentage, ensuring we don't have negative values
  const progressPercentage = totalQuestions > 0 ? 
    Math.floor(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
  
  // Determine if this is the last question (safely)
  const isLastQuestion = totalQuestions > 0 && currentQuestionIndex === totalQuestions - 1;

  // Calculate remaining questions safely, preventing negative values
  const remainingQuestions = totalQuestions > 0 ? 
    Math.max(0, totalQuestions - currentQuestionIndex - 1) : 0;

  return (
    <div className="flex flex-col w-full gap-3">
      <Textarea
        ref={textareaRef}
        value={userResponse}
        onChange={(e) => setUserResponse(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your response here..."
        className="resize-none min-h-[90px] md:min-h-[100px]"
        disabled={isTyping}
      />
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 w-full">
          <Progress value={progressPercentage} className="h-2 flex-grow" />
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {totalQuestions > 0 ? `${currentQuestionIndex + 1}/${totalQuestions}` : "0/0"}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm text-muted-foreground">
            {totalQuestions > 0 ? 
              (!isLastQuestion ? `${remainingQuestions} questions remaining` : "Last question") 
              : "No questions available"}
          </div>
          <div className="flex gap-2">
            {isLastQuestion && onComplete && (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (userResponse.trim()) {
                    // Submit the final response first
                    onSubmit(userResponse);
                    // Then complete the interview
                    setTimeout(() => onComplete(), 300);
                  } else {
                    onComplete();
                  }
                }}
                className="gap-1"
                disabled={isTyping}
              >
                Finish Interview
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={!userResponse.trim() || isTyping}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isLastQuestion ? "Submit & Finish" : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
