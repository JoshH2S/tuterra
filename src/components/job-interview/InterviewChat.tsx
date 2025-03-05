
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
    remainingQuestions,
    transcript,
  } = useJobInterview();

  // Get the most recent AI message from the transcript
  const latestAiMessage = transcript
    .filter(message => message.role === 'ai')
    .slice(-1)[0];
    
  // For debugging
  useEffect(() => {
    console.log("Latest AI message:", latestAiMessage);
    console.log("Current question:", currentQuestion);
    console.log("Remaining questions:", remainingQuestions);
    console.log("Total transcript messages:", transcript.length);
  }, [latestAiMessage, currentQuestion, remainingQuestions, transcript]);

  // Set typing effect when a new AI message is received or question changes
  useEffect(() => {
    console.log("AI message or question changed, triggering typing effect");
    if ((currentQuestion || latestAiMessage) && !isCompleted) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, latestAiMessage, isCompleted]);

  // Set typing effect when a new message is added to transcript
  useEffect(() => {
    if (transcript.length > 0 && !isCompleted) {
      console.log("Transcript updated, triggering typing effect");
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [transcript.length, isCompleted]);

  useEffect(() => {
    // Optional: Implement countdown timer
    if (timeLeft === null) return;
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    // Auto-submit when time runs out
    if (timeLeft === 0 && submitResponse) {
      handleSubmit("");
    }
  }, [timeLeft]);

  const handleSubmit = (response: string) => {
    submitResponse(response);
    setTimeLeft(null);
    setIsTyping(true);
  };

  // Get the message to display in the central area
  const displayMessage = latestAiMessage?.text || currentQuestion?.text || "";

  return (
    <Card className="shadow-lg flex flex-col h-[600px] md:h-[550px]">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">AI Interview</CardTitle>
          <InterviewTimer timeLeft={timeLeft} />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex items-center justify-center p-6 md:p-8">
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
