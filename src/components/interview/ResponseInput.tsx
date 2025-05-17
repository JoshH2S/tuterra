
import { useRef } from "react";
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
    </div>
  );
};
