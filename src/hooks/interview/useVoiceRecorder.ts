
import { useState, useRef } from "react";
import { VoiceRecorder, blobToBase64 } from "@/utils/voice-recorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useVoiceRecorder(onTranscriptionComplete: (text: string) => void) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const { toast } = useToast();

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
              // Call the callback with transcribed text
              onTranscriptionComplete(data.text);
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

  return {
    isRecording,
    isTranscribing,
    toggleRecording
  };
}
