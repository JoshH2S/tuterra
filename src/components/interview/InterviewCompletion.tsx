
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InterviewTranscript } from "@/types/interview";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface InterviewCompletionProps {
  transcript: InterviewTranscript[];
  onDownloadTranscript: (format: 'txt' | 'pdf') => void;
  onStartNew: () => void;
}

export const InterviewCompletion = ({
  transcript,
  onDownloadTranscript,
  onStartNew
}: InterviewCompletionProps) => {
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
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>Interview Complete</CardTitle>
            <CardDescription>
              Thank you for completing your interview simulation
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
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
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3">
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
            <Button 
              onClick={onStartNew} 
              className="w-full sm:w-auto ml-auto"
            >
              Start New Interview
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
