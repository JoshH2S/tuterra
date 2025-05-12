
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InterviewFeedbackComponent } from "./InterviewFeedback";
import { InterviewTranscript } from "@/types/interview";
import { motion } from "framer-motion";
import { useInterviewFeedback } from "@/hooks/interview/useInterviewFeedback";
import { useToast } from "@/hooks/use-toast";

interface InterviewCompletionProps {
  transcript: InterviewTranscript[];
  onDownloadTranscript: (format: 'txt' | 'pdf') => void;
  onStartNew: () => void;
  currentSessionId: string;
  jobTitle: string;
  industry: string;
}

export const InterviewCompletion = ({
  transcript,
  onDownloadTranscript,
  onStartNew,
  currentSessionId,
  jobTitle,
  industry
}: InterviewCompletionProps) => {
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);
  const { 
    generateFeedback, 
    progressToPhase2,
    feedback, 
    feedbackError,
    loading 
  } = useInterviewFeedback();
  const { toast } = useToast();

  useEffect(() => {
    const generateInterviewFeedback = async () => {
      if (transcript.length > 0 && currentSessionId && !feedbackGenerated) {
        try {
          // Generate feedback using OpenAI
          await generateFeedback(
            currentSessionId,
            jobTitle,
            industry,
            transcript
          );
          
          setFeedbackGenerated(true);
          
          toast({
            title: "Interview Complete!",
            description: "Your interview feedback has been generated.",
          });
        } catch (error) {
          console.error("Failed to generate feedback:", error);
        }
      }
    };
    
    generateInterviewFeedback();
  }, [currentSessionId, transcript, feedbackGenerated]);

  const handleContinueToNextPhase = async () => {
    if (!currentSessionId) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "No active session found. Please start a new interview."
      });
      return;
    }
    
    await progressToPhase2(currentSessionId);
  };

  const transformedFeedback = feedback ? {
    id: currentSessionId,
    session_id: currentSessionId,
    feedback: feedback,
    strengths: [], // These would be extracted with more complex parsing
    areas_for_improvement: [],
    overall_score: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : null;

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h1 className="text-2xl font-bold mb-2">Interview Complete</h1>
        <p className="text-muted-foreground">
          You've completed your {jobTitle} interview. Here's your feedback.
        </p>
      </motion.div>

      <InterviewFeedbackComponent
        feedback={transformedFeedback}
        transcript={transcript}
        onDownloadTranscript={onDownloadTranscript}
        onStartNew={onStartNew}
        loading={loading}
        hasError={!!feedbackError}
        onRetry={() => setFeedbackGenerated(false)}
      />

      {feedbackGenerated && feedback && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="mb-4 text-muted-foreground">
            Ready to move forward in your virtual internship?
          </p>
          <Button 
            onClick={handleContinueToNextPhase} 
            size="lg" 
            className="mx-auto"
          >
            Continue to Phase 2: Onboarding
          </Button>
        </motion.div>
      )}
    </div>
  );
};
