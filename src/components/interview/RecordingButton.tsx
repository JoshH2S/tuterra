
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, AudioWaveform } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecordingAnimations } from "@/hooks/interview/useRecordingAnimations";

interface RecordingButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  isDisabled: boolean;
  onToggleRecording: () => void;
}

export const RecordingButton = ({
  isRecording,
  isTranscribing,
  isDisabled,
  onToggleRecording
}: RecordingButtonProps) => {
  const { pulseVariants, waveVariants } = useRecordingAnimations();

  return (
    <div className="relative">
      {/* Animated circles around mic button when recording */}
      {isRecording && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`wave-${i}`}
              custom={i}
              variants={waveVariants}
              initial="idle"
              animate="recording"
              className="absolute inset-0 rounded-full border border-primary"
              style={{ zIndex: -1 }}
            />
          ))}
        </>
      )}
      
      {/* Mic button with animation */}
      <motion.div
        variants={pulseVariants}
        initial="idle"
        animate={isRecording ? "recording" : "idle"}
      >
        <Button
          type="button"
          size="icon"
          variant={isRecording ? "destructive" : "outline"}
          className={cn(
            "rounded-full",
            isRecording && "bg-red-600 hover:bg-red-700 text-white"
          )}
          onClick={onToggleRecording}
          disabled={isDisabled}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <AudioWaveform className="h-4 w-4 animate-pulse" />
          ) : isTranscribing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </motion.div>
    </div>
  );
};
