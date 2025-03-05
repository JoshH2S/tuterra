
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InterviewResponseInputProps {
  onSubmit: (response: string) => void;
  isTyping: boolean;
  remainingQuestions: number;
  onComplete?: () => void;
  allQuestionsAnswered: boolean;
}

export const InterviewResponseInput = ({ 
  onSubmit, 
  isTyping, 
  remainingQuestions,
  onComplete,
  allQuestionsAnswered
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
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {remainingQuestions > 0 ? `${remainingQuestions} questions remaining` : "Last question"}
        </div>
        <div className="flex gap-2">
          {allQuestionsAnswered && onComplete && (
            <Button 
              variant="outline" 
              onClick={onComplete}
              className="gap-1"
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
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};
