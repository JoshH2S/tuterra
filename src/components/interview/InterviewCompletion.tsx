
import { Button } from "@/components/ui/button";
import { PremiumContentCard } from "@/components/ui/premium-card";
import { InterviewTranscript } from "@/types/interview";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Download, Save, Share, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";

interface InterviewCompletionProps {
  transcript: InterviewTranscript[];
  performance?: {
    score: number;
    strengths: string[];
    areasForImprovement: string[];
  };
  onDownloadTranscript: (format: 'txt' | 'pdf') => void;
  onStartNew: () => void;
  onSaveToProfile?: () => void;
  onShare?: () => void;
}

export const InterviewCompletion = ({
  transcript,
  performance,
  onDownloadTranscript,
  onStartNew,
  onSaveToProfile,
  onShare
}: InterviewCompletionProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Check if transcript is empty or has empty answers
  const hasEmptyAnswers = transcript.some(item => !item.answer || item.answer.trim() === '');

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
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => onDownloadTranscript('pdf')} 
                  className="w-full sm:w-auto"
                  variant="outline"
                  disabled={transcript.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  onClick={() => onDownloadTranscript('txt')} 
                  className="w-full sm:w-auto"
                  variant="outline"
                  disabled={transcript.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download as Text
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {onSaveToProfile && (
                  <Button onClick={onSaveToProfile} variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Save to Profile
                  </Button>
                )}
                {onShare && (
                  <Button onClick={onShare} variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                )}
                <Button onClick={onStartNew}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start New Interview
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Performance Summary */}
            {performance && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative h-32 w-32">
                      <CircularProgress percentage={performance.score} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{performance.score}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Strengths</h3>
                    <ul className="list-disc pl-5">
                      {performance.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">Areas for Improvement</h3>
                    <ul className="list-disc pl-5">
                      {performance.areasForImprovement.map((area, i) => (
                        <li key={i}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Warning for missing answers */}
            {hasEmptyAnswers && (
              <div className="mb-4 p-3 border border-yellow-300 bg-yellow-50 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Some of your answers may not appear in the transcript. This could be due to a temporary syncing issue.
                </p>
              </div>
            )}
            
            {/* Detailed Transcript */}
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
                  {(item as any).feedback && (
                    <div className="pl-4 text-sm text-muted-foreground">
                      <span className="text-primary">Feedback: </span>
                      {(item as any).feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PremiumContentCard>
      </motion.div>
    </div>
  );
};
