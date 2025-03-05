
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface InterviewResponseInputProps {
  onSubmit: (response: string) => void;
  isTyping: boolean;
  remainingQuestions: number;
  onComplete?: () => void;
}

export const InterviewResponseInput = ({ 
  onSubmit, 
  isTyping, 
  remainingQuestions,
  onComplete 
}: InterviewResponseInputProps) => {
  const [userResponse, setUserResponse] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-focus textarea when typing indicator disappears
  useEffect(() => {
    if (!isTyping && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isTyping]);

  const handleSubmit = () => {
    if (userResponse.trim() && !isTyping) {
      onSubmit(userResponse);
      setUserResponse("");
    } else if (!userResponse.trim()) {
      toast({
        title: "Empty response",
        description: "Please type your response before submitting.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const characterCount = userResponse.length;
  const maxCharacters = 1000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="flex flex-col w-full gap-3">
      <div className="relative">
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute -top-2 left-0 text-xs text-muted-foreground"
            >
              {isOverLimit ? (
                <span className="text-destructive">
                  {characterCount}/{maxCharacters} characters
                </span>
              ) : (
                <span>
                  {characterCount}/{maxCharacters} characters
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        <Textarea
          ref={textareaRef}
          value={userResponse}
          onChange={(e) => {
            if (e.target.value.length <= maxCharacters) {
              setUserResponse(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type your response here..."
          className={`resize-none min-h-[90px] md:min-h-[100px] transition-colors
            ${isOverLimit ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          disabled={isTyping}
          aria-label="Interview response input"
          aria-describedby={isOverLimit ? "character-limit-error" : undefined}
          maxLength={maxCharacters}
        />
        
        {isOverLimit && (
          <div 
            id="character-limit-error" 
            className="absolute -bottom-6 left-0 text-xs text-destructive"
            role="alert"
          >
            Response exceeds maximum length
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {remainingQuestions > 0 ? `${remainingQuestions} questions remaining` : "Last question"}
        </div>
        <div className="flex gap-2">
          {remainingQuestions === 0 && onComplete && (
            <Button 
              variant="outline" 
              onClick={onComplete}
              className="gap-1"
              aria-label="Finish interview"
            >
              Finish Interview
            </Button>
          )}
          <Button 
            onClick={handleSubmit} 
            disabled={!userResponse.trim() || isTyping || isOverLimit}
            className="gap-2"
            aria-label="Submit response"
          >
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};
