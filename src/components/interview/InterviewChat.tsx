import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InterviewQuestion } from "@/types/interview";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/interview/useVoiceRecorder";
import { QuestionDisplay } from "./QuestionDisplay";
import { RecordingButton } from "./RecordingButton";

interface InterviewChatProps {
  currentQuestion: InterviewQuestion | null;
  onSubmitResponse: (response: string) => void;
  typingEffect: boolean;
  onTypingComplete: () => void;
  isLastQuestion: boolean;
  jobTitle?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const InterviewChat = ({
  currentQuestion,
  onSubmitResponse,
  typingEffect,
  onTypingComplete,
  isLastQuestion,
  jobTitle = "",
  currentQuestionIndex,
  totalQuestions,
}: InterviewChatProps) => {
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isRecording, isTranscribing, formattedTime, toggleRecording } =
    useVoiceRecorder(
      (transcribedText) => {
        setResponse((prev) => {
          const separator = prev.trim().length > 0 ? " " : "";
          return prev + separator + transcribedText;
        });
      },
      { maxRecordingTime: 180000, audioBitsPerSecond: 128000 }
    );

  useEffect(() => {
    setResponse("");
    setIsSubmitting(false);
  }, [currentQuestion]);

  const handleSubmit = async () => {
    if (!response.trim() || !currentQuestion) return;
    setIsSubmitting(true);
    await onSubmitResponse(response);
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const progressPercentage =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  const questionLabel = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
  const headerLabel = jobTitle ? `${jobTitle} Interview` : "Interview";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">

        {/* Card header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500 truncate max-w-[60%]">{headerLabel}</p>
            <p className="text-sm text-gray-400">{questionLabel}</p>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#C8A84B] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 py-6 min-h-[100px]">
          <AnimatePresence mode="wait">
            <QuestionDisplay
              currentQuestion={currentQuestion}
              typingEffect={typingEffect}
            />
          </AnimatePresence>
        </div>

        {/* Answer area */}
        <div className="px-6 pb-6 space-y-4">
          <div className="relative">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your answer here or use the microphone…"
              className="w-full resize-none h-32 rounded-xl border-gray-200 bg-gray-50/60 text-sm focus:bg-white focus-visible:ring-1 focus-visible:ring-[#C8A84B] focus-visible:border-[#C8A84B] pr-12 transition-colors"
              onKeyDown={handleKeyDown}
              disabled={isSubmitting || typingEffect || isRecording || isTranscribing}
            />
            <div className="absolute right-3 top-3 flex flex-col items-center gap-1.5">
              {isRecording && (
                <span className="text-[10px] font-mono bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full leading-none">
                  {formattedTime}
                </span>
              )}
              <RecordingButton
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                isDisabled={isSubmitting || typingEffect}
                onToggleRecording={toggleRecording}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Press <kbd className="px-1 py-0.5 rounded bg-gray-100 font-mono text-[10px]">Enter</kbd> to submit · mic for voice
            </p>
            <Button
              onClick={handleSubmit}
              disabled={!response.trim() || isSubmitting || typingEffect || isRecording || isTranscribing}
              className="rounded-full px-6 bg-[#091747] hover:bg-[#0d2060] text-white text-sm font-medium h-9"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Submitting…
                </>
              ) : isLastQuestion ? (
                "Complete Interview"
              ) : (
                "Next Question →"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
