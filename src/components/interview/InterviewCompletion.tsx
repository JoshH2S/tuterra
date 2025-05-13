
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PremiumContentCard } from "@/components/ui/premium-card";
import { InterviewTranscript } from "@/types/interview";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useInternshipProgress } from "@/hooks/interview/useInternshipProgress";

interface InterviewCompletionProps {
  transcript: InterviewTranscript[];
  onDownloadTranscript: (format: 'txt' | 'pdf') => void;
  onStartNew: () => void;
  sessionId?: string | null;
  jobTitle?: string;
  industry?: string;
}

export const InterviewCompletion = ({
  transcript,
  onDownloadTranscript,
  onStartNew,
  sessionId,
  jobTitle = "",
  industry = ""
}: InterviewCompletionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedbackGenerationStarted, setFeedbackGenerationStarted] = useState(false);
  
  const {
    isGeneratingFeedback,
    feedback,
    error,
    generateInternshipFeedback,
    saveInternshipProgress,
    proceedToNextPhase
  } = useInternshipProgress(sessionId);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Check if transcript is empty or has empty answers
  const hasEmptyAnswers = transcript.some(item => !item.answer || item.answer.trim() === '');

  const handleStartNewInterview = () => {
    onStartNew(); // Call the existing start new method to reset state
    navigate("/interview-simulator"); // Navigate to the original interview simulator page
  };

  useEffect(() => {
    const generateFeedback = async () => {
      if (user && sessionId && transcript.length > 0 && !feedbackGenerationStarted && !feedback) {
        try {
          setFeedbackGenerationStarted(true);
          const feedbackText = await generateInternshipFeedback(transcript, jobTitle, industry);
          await saveInternshipProgress(transcript, feedbackText);
        } catch (error) {
          console.error("Failed to generate or save feedback:", error);
        }
      }
    };

    generateFeedback();
  }, [user, sessionId, transcript, feedbackGenerationStarted, feedback]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <PremiumContentCard
          title="Interview Complete"
          description="Thank you for completing your interview simulation"
          variant="elevated"
          className="shadow-lg"
          headerAction={
            <div className="flex justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          }
          footer={
            <div className="flex flex-wrap gap-3 justify-between">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => onDownloadTranscript('pdf')} 
                  className="w-full sm:w-auto"
                  variant="outline"
                  disabled={transcript.length === 0}
                >
                  Download PDF
                </Button>
                <Button 
                  onClick={() => onDownloadTranscript('txt')} 
                  className="w-full sm:w-auto"
                  variant="outline"
                  disabled={transcript.length === 0}
                >
                  Download as Text
                </Button>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {user && sessionId && feedback ? (
                  <Button 
                    onClick={proceedToNextPhase}
                    className="w-full sm:w-auto"
                    variant="default"
                  >
                    Continue to Phase 2
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStartNewInterview} 
                    className="w-full sm:w-auto"
                  >
                    Start New Interview
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {user && sessionId ? (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Feedback</h3>
                {isGeneratingFeedback ? (
                  <div className="flex flex-col items-center justify-center p-6 space-y-3 border rounded-md bg-muted/30">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Generating feedback on your interview performance...</p>
                  </div>
                ) : error ? (
                  <div className="p-3 border border-yellow-300 bg-yellow-50 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-700 mb-2">
                        We encountered an issue generating feedback.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setFeedbackGenerationStarted(false)}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : feedback ? (
                  <div className="border rounded-md p-4 bg-muted/30">
                    <p className="text-sm whitespace-pre-wrap">{feedback}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <h3 className="text-lg font-medium">Your Interview Transcript</h3>
            
            {hasEmptyAnswers && (
              <div className="mb-4 p-3 border border-yellow-300 bg-yellow-50 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Some of your answers may not appear in the transcript. This could be due to a temporary syncing issue.
                </p>
              </div>
            )}
            
            <div className="border rounded-md p-4 max-h-80 overflow-y-auto space-y-4 text-sm">
              {transcript.map((item, i) => (
                <div key={i} className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0">
                  <div className="font-medium">
                    <span className="text-primary">Q: </span>{item.question}
                  </div>
                  <div className={`pl-4 ${!item.answer || item.answer.trim() === '' ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                    <span className="text-primary">A: </span>
                    {item.answer && item.answer.trim() !== '' ? item.answer : 'No answer recorded'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PremiumContentCard>
      </motion.div>
    </div>
  );
};
