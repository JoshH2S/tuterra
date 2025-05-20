
import { useState, useRef, useEffect } from "react";
import { VoiceRecorder, blobToBase64, convertAudioFormat } from "@/utils/voice-recorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface VoiceRecorderOptions {
  maxRecordingTime?: number;
  preferredMimeType?: string;
  audioBitsPerSecond?: number;
}

export function useVoiceRecorder(
  onTranscriptionComplete: (text: string) => void,
  options?: VoiceRecorderOptions
) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const { toast } = useToast();

  // Cleanup function for unmounting
  useEffect(() => {
    return () => {
      if (voiceRecorderRef.current?.isRecording()) {
        voiceRecorderRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      voiceRecorderRef.current?.stop();
    } else {
      // Start new recorder with enhanced options
      voiceRecorderRef.current = new VoiceRecorder(
        // onStart
        () => {
          setIsRecording(true);
          setRecordingTime(0);
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
            // Try to convert audio to webm format if it's not already
            const processedBlob = await convertAudioFormat(audioBlob, 'audio/webm');
            
            // Convert audio blob to base64
            const base64Audio = await blobToBase64(processedBlob);
            
            // Send to our edge function
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { 
                audio: base64Audio,
                language: 'en' // default to English
              }
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
            setRecordingTime(0);
          }
        },
        // onError
        (error) => {
          setIsRecording(false);
          setRecordingTime(0);
          console.error("Recording error:", error);
          toast({
            title: "Recording error",
            description: error.message || "Could not access microphone",
            variant: "destructive",
          });
        },
        // onRecordingProgress
        (timeElapsed) => {
          setRecordingTime(timeElapsed);
        },
        // options
        {
          mimeType: options?.preferredMimeType,
          audioBitsPerSecond: options?.audioBitsPerSecond || 128000,
          maxRecordingTime: options?.maxRecordingTime || 120000 // 2 minutes default
        }
      );
      
      // Start recording
      voiceRecorderRef.current.start();
    }
  };

  // Format time for display (mm:ss)
  const formattedTime = () => {
    const totalSeconds = Math.floor(recordingTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    isTranscribing,
    recordingTime,
    formattedTime: formattedTime(),
    toggleRecording
  };
}
