
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InterviewQuestion } from "@/types/interview";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { VoiceRecorder, blobToBase64 } from "@/utils/voice-recorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const responseTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Reset response when the question changes
    setResponse("");
    setIsSubmitting(false);
    setIsRecording(false);
    
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

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      voiceRecorderRef.current?.stop();
    } else {
      // Start new recorder
      voiceRecorderRef.current = new VoiceRecorder(
        // onStart
        () => {
          setIsRecording(true);
          toast({
            title: "Recording started",
            description: "Speak clearly into your microphone",
          });
        },
        // onStop
        async (audioBlob) => {
          setIsRecording(false);
          setIsTranscribing(true);
          
          try {
            // Convert audio blob to base64
            const base64Audio = await blobToBase64(audioBlob);
            
            // Send to our edge function
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });
            
            if (error) {
              throw new Error(error.message);
            }
            
            if (data.text) {
              // Append the transcribed text to current response
              setResponse(prev => {
                const separator = prev.trim().length > 0 ? " " : "";
                return prev + separator + data.text;
              });
            }
          } catch (error) {
            console.error("Transcription error:", error);
            toast({
              title: "Transcription failed",
              description: error instanceof Error ? error.message : "Could not convert speech to text",
              variant: "destructive",
            });
          } finally {
            setIsTranscribing(false);
          }
        },
        // onError
        (error) => {
          setIsRecording(false);
          console.error("Recording error:", error);
          toast({
            title: "Recording error",
            description: error.message || "Could not access microphone",
            variant: "destructive",
          });
        }
      );
      
      // Start recording
      voiceRecorderRef.current.start();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
      <Card className="flex-1 flex flex-col mb-4 shadow-md overflow-hidden">
        <CardContent className="flex-1 p-6 pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center"
            >
              {currentQuestion && typingEffect ? (
                <TextShimmer 
                  className="text-lg font-medium"
                  duration={2}
                >
                  {currentQuestion.question}
                </TextShimmer>
              ) : (
                <div className="text-lg font-medium">
                  {currentQuestion?.question}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="p-6 border-t">
          <div className="w-full space-y-4">
            <div className="relative">
              <Textarea
                ref={responseTextareaRef}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your answer here or use the microphone..."
                className="w-full resize-none h-32 focus:ring-1 focus:ring-primary pr-10"
                onKeyDown={handleKeyDown}
                disabled={isSubmitting || typingEffect || isRecording || isTranscribing}
              />
              <div className="absolute right-3 top-3">
                <Button
                  type="button"
                  size="icon"
                  variant={isRecording ? "destructive" : "outline"}
                  className="rounded-full"
                  onClick={toggleRecording}
                  disabled={isSubmitting || typingEffect || isTranscribing}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : isTranscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
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
