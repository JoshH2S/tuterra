
import { Button } from "@/components/ui/button";
import { PremiumContentCard } from "@/components/ui/premium-card";
import { InterviewTranscript } from "@/types/interview";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, ArrowRightCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useInternshipProgress } from "@/hooks/interview/useInternshipProgress";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState<string>("transcript");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const {
    generateFeedback,
    continueToPhase2,
    feedback,
    loading
  } = useInternshipProgress(sessionId);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Check if transcript is empty or has empty answers
  const hasEmptyAnswers = transcript.some(item => !item.answer || item.answer.trim() === '');
  
  // Check if there's enough data for feedback
  const canGenerateFeedback = transcript.length > 0 && 
                             !hasEmptyAnswers && 
                             jobTitle && 
                             industry;

  useEffect(() => {
    // Automatically generate feedback if user is logged in and we have transcript
    const autoGenerateFeedback = async () => {
      if (user && canGenerateFeedback && !feedback && !loading) {
        await generateFeedback(transcript, jobTitle, industry);
      } else if (!user && canGenerateFeedback) {
        setShowLoginPrompt(true);
      }
    };
    
    autoGenerateFeedback();
  }, [user, transcript, canGenerateFeedback]);

  const handleStartNewInterview = () => {
    onStartNew(); // Call the existing start new method to reset state
    navigate("/interview-simulator"); // Navigate to the original interview simulator page
  };
  
  const handleLoginAndContinue = () => {
    // Store current session data in localStorage to retrieve after login
    try {
      if (sessionId) {
        localStorage.setItem('pending_interview_session', sessionId);
        localStorage.setItem('pending_interview_job_title', jobTitle);
        localStorage.setItem('pending_interview_industry', industry);
      }
    } catch (err) {
      console.error("Error saving session info to localStorage:", err);
    }
    
    navigate("/auth");
  };
  
  const handlePhase2Navigation = async () => {
    await continueToPhase2();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <PremiumContentCard
          title={feedback ? "Interview Completion & Feedback" : "Interview Complete"}
          description={feedback ? "Review your AI-generated feedback and transcript" : "Thank you for completing your interview simulation"}
          variant="elevated"
          className="shadow-lg"
          headerAction={
            <div className="flex justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          }
          footer={
            <div className="flex flex-col sm:flex-row gap-3">
              {!user && showLoginPrompt ? (
                <Button 
                  onClick={handleLoginAndContinue} 
                  className="w-full"
                  variant="default"
                >
                  Sign in for Feedback & Progress
                </Button>
              ) : (
                <>
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
                  {feedback ? (
                    <Button 
                      onClick={handlePhase2Navigation}
                      className="w-full sm:w-auto ml-auto group"
                      disabled={loading}
                    >
                      Continue to Phase 2
                      <ArrowRightCircle className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : user && canGenerateFeedback ? (
                    <Button 
                      onClick={handleStartNewInterview} 
                      className="w-full sm:w-auto ml-auto"
                    >
                      Start New Interview
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          }
        >
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating feedback...</p>
            </div>
          ) : (
            <>
              {feedback ? (
                <Tabs defaultValue="feedback" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="feedback" className="mt-0 p-1">
                    <div className="space-y-4 p-2">
                      <div className="text-base whitespace-pre-line">
                        {feedback}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="transcript" className="mt-0">
                    <div className="space-y-4">
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
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Your Interview Transcript</h3>
                  
                  {hasEmptyAnswers && (
                    <div className="mb-4 p-3 border border-yellow-300 bg-yellow-50 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-700">
                        Some of your answers may not appear in the transcript. This could be due to a temporary syncing issue.
                      </p>
                    </div>
                  )}
                  
                  {showLoginPrompt && !user && (
                    <div className="mb-4 p-4 border border-blue-300 bg-blue-50 rounded-md">
                      <h4 className="text-base font-medium text-blue-800 mb-2">Sign in to continue your internship</h4>
                      <p className="text-sm text-blue-700 mb-3">
                        To receive personalized feedback and continue to the next phase of your virtual internship, please sign in or create an account.
                      </p>
                      <Button onClick={handleLoginAndContinue} size="sm">
                        Sign in
                      </Button>
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
              )}
            </>
          )}
        </PremiumContentCard>
      </motion.div>
    </div>
  );
};
