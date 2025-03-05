
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { useJobInterview } from "@/hooks/useJobInterview";
import { InterviewTypingIndicator } from "./InterviewTypingIndicator";
import { InterviewCompleted } from "./InterviewCompleted";
import { InterviewQuestion } from "./InterviewQuestion";
import { InterviewResponseInput } from "./InterviewResponseInput";
import { InterviewTimer } from "./InterviewTimer";
import { TranscriptDownload } from "./TranscriptDownload";

interface InterviewChatProps {
  isCompleted: boolean;
  onComplete: () => void;
}

export const InterviewChat = ({ isCompleted, onComplete }: InterviewChatProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const { 
    currentQuestion, 
    submitResponse,
    remainingQuestions,
    transcript,
    questions,
  } = useJobInterview();

  // Memoize the latest AI message to prevent unnecessary re-renders
  const latestAiMessage = useMemo(() => 
    transcript
      .filter(message => message.role === 'ai')
      .slice(-1)[0],
    [transcript]
  );

  // Memoize the display message
  const displayMessage = useMemo(() => 
    latestAiMessage?.text || currentQuestion?.text || "",
    [latestAiMessage, currentQuestion]
  );

  // Debounced typing effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if ((currentQuestion || latestAiMessage) && !isCompleted) {
      setIsTyping(true);
      timeoutId = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentQuestion, latestAiMessage, isCompleted]);

  // Optimized timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && submitResponse) {
      handleSubmit("(Time expired)");
    }
  }, [timeLeft, submitResponse]);

  // Memoize the submit handler
  const handleSubmit = useCallback((response: string) => {
    submitResponse(response);
    setTimeLeft(null);
    setIsTyping(true);
  }, [submitResponse]);

  // Memoize the question counter
  const questionCounter = useMemo(() => {
    if (!isCompleted && questions.length > 0) {
      return `Q: ${transcript.filter(m => m.role === 'ai').length}/${questions.length}`;
    }
    return null;
  }, [isCompleted, questions.length, transcript]);

  return (
    <Card className="shadow-lg flex flex-col h-[600px] md:h-[550px]">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">AI Interview</CardTitle>
          <div className="flex items-center gap-4">
            {isCompleted && <TranscriptDownload transcript={transcript} />}
            <InterviewTimer timeLeft={timeLeft} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex items-center justify-center p-6 md:p-8 relative">
        {questionCounter && (
          <div className="absolute top-2 right-2 text-xs text-muted-foreground">
            {questionCounter}
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {isTyping ? (
            <InterviewTypingIndicator />
          ) : isCompleted ? (
            <InterviewCompleted />
          ) : (
            <InterviewQuestion 
              message={displayMessage} 
              transcriptLength={transcript.length} 
            />
          )}
        </AnimatePresence>
      </CardContent>
      
      {!isCompleted && (
        <CardFooter className="border-t p-4">
          <InterviewResponseInput
            onSubmit={handleSubmit}
            isTyping={isTyping}
            remainingQuestions={remainingQuestions}
            onComplete={onComplete}
          />
        </CardFooter>
      )}
    </Card>
  );
};
