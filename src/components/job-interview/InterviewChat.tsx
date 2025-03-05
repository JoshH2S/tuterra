
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { useJobInterview } from "@/hooks/useJobInterview";
import { InterviewTypingIndicator } from "./InterviewTypingIndicator";
import { InterviewCompleted } from "./InterviewCompleted";
import { InterviewQuestion } from "./InterviewQuestion";
import { InterviewResponseInput } from "./InterviewResponseInput";
import { InterviewTimer } from "./InterviewTimer";
import { Progress } from "@/components/ui/progress";

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
    isGeneratingFeedback,
    feedback,
    completeInterview,
    currentQuestionIndex,
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
    console.log("Total questions loaded:", questions.length);
    console.log("Current question index:", currentQuestionIndex);
  }, [latestAiMessage, currentQuestion, remainingQuestions, transcript, questions, currentQuestionIndex]);

  // Set typing effect when a new AI message is received or question changes
  useEffect(() => {
    console.log("AI message or question changed, triggering typing effect");
    if ((currentQuestion || latestAiMessage) && !isCompleted) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1500); 
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
      }, 1500);
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
      handleSubmit("(Time expired)");
    }
  }, [timeLeft]);

  const handleSubmit = (response: string) => {
    console.log("Handle submit called with response:", response);
    submitResponse(response);
    setTimeLeft(null);
    setIsTyping(true);
    
    // Add a timeout to ensure typing indicator is shown
    setTimeout(() => {
      console.log("Checking transcript after response:", transcript.length);
    }, 2000);
  };

  // Get the message to display in the central area
  const displayMessage = latestAiMessage?.text || currentQuestion?.text || "";
  
  // Calculate progress percentage
  const totalQuestions = questions.length;
  const answeredQuestions = Math.min(currentQuestionIndex, totalQuestions);
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <Card className="shadow-lg flex flex-col h-[600px] md:h-[550px]">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl md:text-2xl">AI Interview</CardTitle>
          <InterviewTimer timeLeft={timeLeft} />
        </div>
        
        {questions.length > 0 && !isCompleted && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex items-center justify-center p-6 md:p-8 relative">        
        <AnimatePresence mode="wait">
          {isTyping ? (
            <InterviewTypingIndicator />
          ) : isCompleted ? (
            <InterviewCompleted 
              isLoading={isGeneratingFeedback} 
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
            remainingQuestions={remainingQuestions}
            onComplete={completeInterview}
            allQuestionsAnswered={remainingQuestions === 0}
          />
        </CardFooter>
      )}
    </Card>
  );
};
