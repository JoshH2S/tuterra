
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InterviewTranscript } from "@/types/interview";
import { Check, Download, RefreshCw, ChevronRight, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInternshipFeedback } from "@/hooks/useInternshipFeedback";
import { useAuth } from "@/hooks/useAuth";

interface InterviewCompletionProps {
  transcript: InterviewTranscript[];
  onDownloadTranscript: (format: 'txt' | 'pdf') => void;
  onStartNew: () => void;
  sessionId?: string | null;
}

export const InterviewCompletion = ({
  transcript,
  onDownloadTranscript,
  onStartNew,
  sessionId
}: InterviewCompletionProps) => {
  const [view, setView] = useState<'transcript' | 'feedback'>('transcript');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    generateFeedback,
    fetchExistingFeedback,
    feedback,
    hasGeneratedFeedback,
    loading: feedbackLoading,
    internshipSessionId
  } = useInternshipFeedback(sessionId);

  useEffect(() => {
    const checkExistingFeedback = async () => {
      await fetchExistingFeedback();
    };
    
    checkExistingFeedback();
  }, [sessionId]);

  const handleGenerateFeedback = async () => {
    await generateFeedback(transcript);
  };
  
  const handleContinueToNextPhase = () => {
    if (internshipSessionId) {
      navigate(`/internship/${internshipSessionId}`);
    } else {
      toast({
        title: "Error",
        description: "Could not find internship session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Interview Complete!</h1>
          <p className="text-muted-foreground">
            Thank you for completing your interview. You can view your transcript below.
          </p>
        </div>

        <div className="mt-8 flex justify-center space-x-2">
          <Button 
            variant={view === 'transcript' ? "default" : "outline"}
            onClick={() => setView('transcript')}
            className="px-4 py-2"
          >
            Transcript
          </Button>
          <Button 
            variant={view === 'feedback' ? "default" : "outline"}
            onClick={() => setView('feedback')}
            className="px-4 py-2"
            disabled={!hasGeneratedFeedback && !feedbackLoading}
          >
            Feedback
            {!hasGeneratedFeedback && !feedbackLoading && (
              <span className="ml-2 text-xs text-muted-foreground">(Generate first)</span>
            )}
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        {view === 'transcript' && (
          <div className="space-y-6">
            {transcript.map((item, index) => (
              <div key={index} className="border rounded-md p-4 bg-muted/30">
                <p className="font-medium mb-2">Question {index + 1}: {item.question}</p>
                <p className="text-muted-foreground">Your answer: {item.answer}</p>
              </div>
            ))}
          </div>
        )}
        
        {view === 'feedback' && (
          <div className="space-y-4">
            {feedbackLoading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-center text-muted-foreground">
                  Generating interview feedback...
                </p>
              </div>
            ) : feedback ? (
              <div className="border rounded-md p-6 bg-muted/30 whitespace-pre-line">
                <h3 className="text-xl font-medium mb-4">Your Interview Feedback</h3>
                {feedback}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <p className="text-center text-muted-foreground mb-4">
                  No feedback generated yet. Click below to generate feedback on your interview answers.
                </p>
                <Button onClick={handleGenerateFeedback}>
                  Generate Feedback
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => onDownloadTranscript('txt')}>
              <Download className="h-4 w-4 mr-1" />
              Download TXT
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDownloadTranscript('pdf')}>
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onStartNew}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Start New Interview
            </Button>
            
            {user && feedback && (
              <Button onClick={handleContinueToNextPhase}>
                Continue to Phase 2
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
