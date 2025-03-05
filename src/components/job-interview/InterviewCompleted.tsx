
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { DetailedFeedback, AIFeedback } from "@/components/quiz-results/DetailedFeedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InterviewCompletedProps {
  isLoading: boolean;
  feedback: AIFeedback | null;
}

export const InterviewCompleted = ({ isLoading, feedback }: InterviewCompletedProps) => {
  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-4 p-4 w-full max-w-[90%] md:max-w-2xl mx-auto"
    >
      <h3 className="text-xl font-medium">Interview Completed!</h3>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-2 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing your interview responses...</p>
        </div>
      ) : (
        <>
          <div className="mt-4 mb-6">
            <DetailedFeedback feedback={feedback} />
          </div>
          
          <Button variant="outline" className="gap-2 w-full md:w-auto md:px-4">
            <Download className="h-4 w-4" />
            Download Transcript & Feedback
          </Button>
        </>
      )}
    </motion.div>
  );
};
