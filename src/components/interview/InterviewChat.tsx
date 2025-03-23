
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { InterviewQuestion } from "@/types/interview";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/interview/useVoiceRecorder";
import { QuestionDisplay } from "./QuestionDisplay";
import { ResponseInput } from "./ResponseInput";

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
  
  // Use our custom hook for voice recording
  const { isRecording, isTranscribing, toggleRecording } = useVoiceRecorder(
    (transcribedText) => {
      // Append the transcribed text to current response
      setResponse(prev => {
        const separator = prev.trim().length > 0 ? " " : "";
        return prev + separator + transcribedText;
      });
    }
  );
  
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
            <QuestionDisplay 
              currentQuestion={currentQuestion} 
              typingEffect={typingEffect} 
            />
          </AnimatePresence>
        </CardContent>
        <CardFooter className="p-6 border-t">
          <div className="w-full space-y-4">
            <ResponseInput
              response={response}
              onResponseChange={setResponse}
              onKeyDown={handleKeyDown}
              isSubmitting={isSubmitting}
              typingEffect={typingEffect}
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onToggleRecording={toggleRecording}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter to submit or use the microphone to speak
              </p>
              <Button 
                onClick={handleSubmit} 
                disabled={!response.trim() || isSubmitting || typingEffect || isRecording || isTranscribing}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : isLastQuestion ? (
                  "Complete Interview"
                ) : (
                  "Next Question"
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
