
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
import { Loader, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterviewErrorBoundary } from "./InterviewErrorBoundary";
import { createQuestionMessage, createUserResponseMessage } from "@/services/interviewTranscriptService";

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
    setTranscript,
    isGeneratingFeedback,
    feedback,
    detailedFeedback,
    currentQuestionIndex,
    regenerateFeedback,
    isGenerating,
    startInterview
  } = useJobInterview();

  const displayMessage = useMemo(() => 
    currentQuestion?.text || "", 
    [currentQuestion]
  );

  useEffect(() => {
    if (currentQuestion && !isCompleted && !isTyping) {
      const questionExists = transcript.some(msg => 
        msg.role === 'ai' && msg.id === currentQuestion.id
      );
      
      if (!questionExists) {
        const questionMessage = createQuestionMessage(currentQuestion);
        setTranscript(prev => [...prev, questionMessage]);
      }
    }
  }, [currentQuestion, isCompleted, isTyping, transcript, setTranscript]);

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

  useEffect(() => {
    if (timeLeft === 0 && submitResponse) {
      handleSubmit("(Time expired)");
    }
  }, [timeLeft, submitResponse]);

  const handleSubmit = useCallback((response: string) => {
    if (!currentQuestion) return;
    
    const userMessage = createUserResponseMessage(response);
    setTranscript(prev => [...prev, userMessage]);
    
    submitResponse(response);
    setTimeLeft(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setIsTyping(true);
      requestAnimationFrame(() => {
        setTimeout(() => setIsTyping(false), 1000);
      });
    }
  }, [currentQuestion, currentQuestionIndex, questions.length, submitResponse, setTranscript]);

  useEffect(() => {
    if (currentQuestion?.estimatedTimeSeconds && !isTyping && !isCompleted) {
      if (timeLeft === null) {
        setTimeLeft(currentQuestion.estimatedTimeSeconds);
      }
    }
  }, [currentQuestion, isTyping, isCompleted, timeLeft]);

  const handleReset = useCallback(() => {
    console.log("Attempting to restart interview");
    startInterview();
  }, [startInterview]);

  return (
    <InterviewErrorBoundary onReset={handleReset}>
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
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <Loader className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Generating interview questions...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center p-6 space-y-4">
              <p className="text-muted-foreground">No questions available.</p>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {isTyping ? (
                <InterviewTypingIndicator key="typing" />
              ) : isCompleted ? (
                <InterviewCompleted 
                  key="completed"
                  transcript={transcript} 
                  isGeneratingFeedback={isGeneratingFeedback}
                  feedback={feedback}
                  detailedFeedback={detailedFeedback}
                  onRegenerateFeedback={regenerateFeedback}
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
          )}
        </CardContent>
        
        {!isCompleted && !isGenerating && questions.length > 0 && (
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
    </InterviewErrorBoundary>
  );
};
