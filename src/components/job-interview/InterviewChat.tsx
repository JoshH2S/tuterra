
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { useJobInterview } from "@/hooks/useJobInterview";
import { InterviewTypingIndicator } from "./InterviewTypingIndicator";
import { InterviewCompleted } from "./InterviewCompleted";
import { InterviewQuestion } from "./InterviewQuestion";
import { InterviewResponseInput } from "./InterviewResponseInput";
import { InterviewTimer } from "./InterviewTimer";

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

  // Set typing effect when the component first loads
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, []);

  // Set typing effect when the question changes
  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, isCompleted]);

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    // Auto-submit when time runs out
    if (timeLeft === 0 && submitResponse) {
      handleSubmit("(Time expired)");
    }
  }, [timeLeft]);

  const handleSubmit = (response: string) => {
    console.log(`Submitting response for question ${currentQuestionIndex + 1}/${questions.length}`);
    submitResponse(response);
    setTimeLeft(null);
    
    // Only set typing if not on the last question
    if (currentQuestionIndex < questions.length - 1) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  // Get the message to display
  const displayMessage = currentQuestion?.text || "";

  return (
    <Card className="shadow-lg flex flex-col h-[600px] md:h-[550px]">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">AI Interview</CardTitle>
          <InterviewTimer timeLeft={timeLeft} />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex items-center justify-center p-6 md:p-8 relative">
        <div className="absolute top-2 right-2 text-xs text-muted-foreground">
          {!isCompleted && questions.length > 0 && (
            <span>Q: {currentQuestionIndex + 1}/{questions.length}</span>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {isTyping ? (
            <InterviewTypingIndicator />
          ) : isCompleted ? (
            <InterviewCompleted 
              transcript={transcript} 
              isGeneratingFeedback={isGeneratingFeedback}
              feedback={feedback}
            />
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
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onComplete={onComplete}
          />
        </CardFooter>
      )}
    </Card>
  );
};
