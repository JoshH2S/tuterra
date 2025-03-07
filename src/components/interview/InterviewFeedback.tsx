
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InterviewFeedback, InterviewTranscript } from "@/types/interview";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InterviewFeedbackProps {
  feedback: InterviewFeedback | null;
  transcript: InterviewTranscript[];
  onDownloadTranscript: (format: 'txt' | 'pdf') => void;
  onStartNew: () => void;
  loading: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

export const InterviewFeedbackComponent = ({
  feedback,
  transcript,
  onDownloadTranscript,
  onStartNew,
  loading,
  hasError = false,
  onRetry
}: InterviewFeedbackProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Interview Feedback</CardTitle>
            <CardDescription>
              Here's an AI-powered analysis of your interview performance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : hasError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Feedback Generation Failed</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-4">There was an error generating your interview feedback.</p>
                  {onRetry && (
                    <Button 
                      onClick={onRetry} 
                      variant="outline" 
                      size="sm"
                      className="mt-1"
                    >
                      Try Again
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ) : feedback ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Overall Assessment</h3>
                  <p className="text-gray-700">{feedback.feedback}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {feedback.strengths.map((strength, i) => (
                      <li key={i} className="text-gray-700">{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Areas for Improvement</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {feedback.areas_for_improvement.map((area, i) => (
                      <li key={i} className="text-gray-700">{area}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Your Interview Transcript</h3>
                  <div className="border rounded-md p-4 max-h-80 overflow-y-auto space-y-4 text-sm">
                    {transcript.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="font-medium">Q: {item.question}</p>
                        <p className="text-gray-700">A: {item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No feedback available yet.</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => onDownloadTranscript('pdf')} 
              className="w-full sm:w-auto"
              variant="outline"
              disabled={transcript.length === 0 || loading}
            >
              Download PDF
            </Button>
            <Button 
              onClick={() => onDownloadTranscript('txt')} 
              className="w-full sm:w-auto"
              variant="outline"
              disabled={transcript.length === 0 || loading}
            >
              Download as Text
            </Button>
            <Button 
              onClick={onStartNew} 
              className="w-full sm:w-auto ml-auto"
              disabled={loading}
            >
              Start New Interview
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
