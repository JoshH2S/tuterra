
import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { RecordingButton } from "./RecordingButton";

interface ResponseInputProps {
  response: string;
  onResponseChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isSubmitting: boolean;
  typingEffect: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  onToggleRecording: () => void;
  recordingTime?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export const ResponseInput = ({
  response,
  onResponseChange,
  onKeyDown,
  isSubmitting,
  typingEffect,
  isRecording,
  isTranscribing,
  onToggleRecording,
  recordingTime = "00:00",
  inputRef
}: ResponseInputProps) => {
  const defaultRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef || defaultRef;
  
  // Effect to focus the textarea when typing effect ends
  useEffect(() => {
    if (!typingEffect && !isSubmitting && !isRecording && !isTranscribing && textareaRef.current) {
      console.log("ResponseInput: Focusing textarea after typing effect ended");
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
        
        // On mobile, try to scroll to the textarea to avoid keyboard covering it
        if (window.innerWidth <= 768) {
          textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [typingEffect, isSubmitting, isRecording, isTranscribing]);
  
  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={response}
        onChange={(e) => onResponseChange(e.target.value)}
        placeholder="Type your answer here or use the microphone..."
        className="w-full resize-none h-32 focus:ring-1 focus:ring-primary pr-10"
        onKeyDown={onKeyDown}
        disabled={isSubmitting || typingEffect || isRecording || isTranscribing}
        aria-disabled={isSubmitting || typingEffect || isRecording || isTranscribing}
      />
      <div className="absolute right-3 top-3 flex items-center gap-2">
        {isRecording && (
          <div className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded-full">
            {recordingTime}
          </div>
        )}
        <RecordingButton
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          isDisabled={isSubmitting || typingEffect}
          onToggleRecording={onToggleRecording}
        />
      </div>
      
      {/* Visual indicator when typing effect is active */}
      {typingEffect && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 bg-opacity-10 dark:bg-opacity-10 pointer-events-none flex items-center justify-center">
          <p className="text-xs text-muted-foreground animate-pulse">
            Wait for the interviewer...
          </p>
        </div>
      )}
    </div>
  );
};
