
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import { Message } from "@/types/interview";

interface TranscriptDownloadProps {
  transcript: Message[];
}

export const TranscriptDownload = ({ transcript }: TranscriptDownloadProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;
      
      // Add title
      doc.setFontSize(16);
      doc.text("Interview Transcript", margin, y);
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
      
      doc.save("interview-transcript.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownload}
      disabled={downloading}
      className="gap-1"
    >
      {downloading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Transcript</span>
    </Button>
  );
};
