
import React, { useRef } from "react";
import { QuestionDisplay } from "./QuestionDisplay";
import { ResponseInput } from "./ResponseInput";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { InterviewQuestion } from "@/types/interview";
import { Card } from "@/components/ui/card";
import { useVoiceRecorder } from "@/hooks/interview/useVoiceRecorder"; 

interface InterviewChatProps {
  currentQuestion: InterviewQuestion | null;
  onSubmitResponse: (response: string) => void;
  typingEffect: boolean;
  onTypingComplete?: () => void;
  isLastQuestion: boolean;
  jobTitle: string;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export const InterviewChat: React.FC<InterviewChatProps> = ({
  currentQuestion,
  onSubmitResponse,
  typingEffect,
  onTypingComplete,
  isLastQuestion,
  jobTitle,
  inputRef: externalInputRef 
}) => {
  const [response, setResponse] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const internalInputRef = useRef<HTMLTextAreaElement>(null);
  const activeInputRef = externalInputRef || internalInputRef;
  
  // Use voice recorder hook for speech-to-text functionality
  const { 
    isRecording, 
    isTranscribing, 
    formattedTime, 
    toggleRecording 
  } = useVoiceRecorder((transcribedText) => {
    // Append transcribed text to existing response
    setResponse(prev => {
      const separator = prev && !prev.endsWith(' ') ? ' ' : '';
      return prev + separator + transcribedText;
    });
  });
  
  // Handle submission of the response
  const handleSubmit = async () => {
    if (!response.trim() || isSubmitting || typingEffect) return;
    
    setIsSubmitting(true);
    try {
      await onSubmitResponse(response);
      setResponse('');
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !typingEffect) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  
  return (
    <Card className="shadow-md p-4 md:p-6 h-full flex flex-col">
      <div className="bg-muted/50 rounded-md p-3 md:p-4 mb-4 flex-grow overflow-y-auto">
        <QuestionDisplay
          currentQuestion={currentQuestion}
          typingEffect={typingEffect}
          onTypingComplete={onTypingComplete}
        />
      </div>
      
      <div className="mt-2">
        <ResponseInput
          response={response}
          onResponseChange={setResponse}
          onKeyDown={handleKeyDown}
          isSubmitting={isSubmitting}
          typingEffect={typingEffect}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          onToggleRecording={toggleRecording}
          recordingTime={formattedTime}
          inputRef={activeInputRef}
        />
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={!response.trim() || isSubmitting || typingEffect}
            size="lg"
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-pulse">Submitting</span>
                <span className="ml-2 animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              </span>
            ) : (
              <span className="flex items-center">
                {isLastQuestion ? "Finish" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
