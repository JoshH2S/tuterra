
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InterviewQuestion } from "@/types/interview";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";

interface InterviewChatProps {
  currentQuestion: InterviewQuestion | null;
  onSubmitResponse: (response: string) => void;
  typingEffect: boolean;
  onTypingComplete: () => void;
  isLastQuestion: boolean;
}

export const InterviewChat = ({
  currentQuestion,
  onSubmitResponse,
  typingEffect,
  onTypingComplete,
  isLastQuestion
}: InterviewChatProps) => {
  const [response, setResponse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const responseTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Reset response when the question changes
    setResponse("");
    setIsSubmitting(false);
    
    // Auto focus on textarea after typing effect is complete
    if (!typingEffect && responseTextareaRef.current) {
      responseTextareaRef.current.focus();
    }
  }, [currentQuestion, typingEffect]);
  
  const handleSubmit = async () => {
    if (!response.trim() || !currentQuestion) return;
    
    setIsSubmitting(true);
    await onSubmitResponse(response);
    setIsSubmitting(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
      <Card className="flex-1 flex flex-col mb-4 shadow-md overflow-hidden">
        <CardContent className="flex-1 p-6 pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center"
            >
              {currentQuestion && typingEffect ? (
                <TextShimmer 
                  className="text-lg font-medium"
                  duration={2}
                >
                  {currentQuestion.question}
                </TextShimmer>
              ) : (
                <div className="text-lg font-medium">
                  {currentQuestion?.question}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="p-6 border-t">
          <div className="w-full space-y-4">
            <Textarea
              ref={responseTextareaRef}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full resize-none h-32 focus:ring-1 focus:ring-primary"
              onKeyDown={handleKeyDown}
              disabled={isSubmitting || typingEffect}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter to submit
              </p>
              <Button 
                onClick={handleSubmit} 
                disabled={!response.trim() || isSubmitting || typingEffect}
              >
                {isLastQuestion ? "Complete Interview" : "Next Question"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
