
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";

interface InterviewCompletedProps {
  transcript: Array<{id: string; role: string; text: string}>;
  isGeneratingFeedback?: boolean;
  feedback?: string;
}

export const InterviewCompleted = ({ 
  transcript, 
  isGeneratingFeedback = false,
  feedback
}: InterviewCompletedProps) => {
  const [downloading, setDownloading] = useState(false);

  const downloadTranscript = () => {
    setDownloading(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;
      
      // Add title
      doc.setFontSize(16);
      doc.text("Interview Transcript and Feedback", margin, y);
      y += 15;
      
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
      y += 15;
      
      // Add transcript section
      doc.setFontSize(14);
      doc.text("Transcript", margin, y);
      y += 10;
      
      // Add messages
      doc.setFontSize(10);
      
      transcript.forEach((message) => {
        const roleText = message.role === 'ai' ? "Interviewer" : "You";
        const text = `${roleText}: ${message.text}`;
        
        // Text wrapping
        const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
        
        // Check if we need a new page
        if (y + splitText.length * 7 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = 20;
        }
        
        // Add the text
        doc.text(splitText, margin, y);
        y += splitText.length * 7 + 5;
      });
      
      // Add AI feedback if available
      if (feedback) {
        // Add a new page for feedback
        doc.addPage();
        y = 20;
        
        doc.setFontSize(14);
        doc.text("AI Feedback", margin, y);
        y += 10;
        
        doc.setFontSize(10);
        const splitFeedback = doc.splitTextToSize(feedback, pageWidth - 2 * margin);
        doc.text(splitFeedback, margin, y);
      }
      
      doc.save("interview-transcript.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloading(false);
    }
  };
  
  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6 p-4 max-w-[90%] md:max-w-md mx-auto"
    >
      <h3 className="text-xl font-medium">Interview Completed!</h3>
      
      {isGeneratingFeedback ? (
        <>
          <div className="flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Analyzing your interview responses...
            </p>
          </div>
        </>
      ) : (
        <>
          {feedback && (
            <div className="text-left bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto mb-4">
              <h4 className="font-medium mb-2">AI Feedback:</h4>
              <p className="text-sm whitespace-pre-line">{feedback}</p>
            </div>
          )}
          
          <p className="text-muted-foreground">
            Thank you for participating. You can now download your interview transcript{feedback ? " and feedback" : ""}.
          </p>
          
          <Button 
            variant="outline" 
            className="gap-2 w-full md:w-auto md:px-4"
            onClick={downloadTranscript}
            disabled={downloading}
          >
            {downloading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download {feedback ? "Transcript & Feedback" : "Transcript"}
          </Button>
        </>
      )}
    </motion.div>
  );
};
