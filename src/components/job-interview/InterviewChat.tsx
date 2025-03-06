
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
    questions,
    transcript,
    isGeneratingFeedback,
    feedback,
    currentQuestionIndex,
  } = useJobInterview();

  // Memoize derived values
  const displayMessage = useMemo(() => 
    currentQuestion?.text || "", 
    [currentQuestion]
  );

  // Removed the questionProgress since it's now handled in the InterviewQuestion component

  // Combine typing effects into a single useEffect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (currentQuestion && !isCompleted) {
      setIsTyping(true);
      timeoutId = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [currentQuestion, currentQuestionIndex, isCompleted]);

  // Optimized timer logic using setInterval
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Handle time expiration
  useEffect(() => {
    if (timeLeft === 0 && submitResponse) {
      handleSubmit("(Time expired)");
    }
  }, [timeLeft, submitResponse]);

  // Memoized submit handler
  const handleSubmit = useCallback((response: string) => {
    submitResponse(response);
    setTimeLeft(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setIsTyping(true);
      // Use RAF for smoother animation timing
      requestAnimationFrame(() => {
        setTimeout(() => setIsTyping(false), 1000);
      });
    }
  }, [currentQuestionIndex, questions.length, submitResponse]);

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
        <AnimatePresence mode="wait" initial={false}>
          {isTyping ? (
            <InterviewTypingIndicator key="typing" />
          ) : isCompleted ? (
            <InterviewCompleted 
              key="completed"
              transcript={transcript} 
              isGeneratingFeedback={isGeneratingFeedback}
              feedback={feedback}
            />
          ) : (
            <InterviewQuestion 
              key={`question-${currentQuestionIndex}`}
              message={displayMessage} 
              transcriptLength={transcript.length}
              question={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
            />
          )}
        </AnimatePresence>
      </CardContent>
      
      {!isCompleted && (
        <CardFooter className="border-t p-4">
          <InterviewResponseInput
            onSubmit={handleSubmit}
            isTyping={isTyping}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onComplete={onComplete}
          />
        </CardFooter>
      )}
    </Card>
  );
};
