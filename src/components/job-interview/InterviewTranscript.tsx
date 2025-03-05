
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
}

interface InterviewTranscriptProps {
  transcript: Message[];
}

export const InterviewTranscript = ({ transcript }: InterviewTranscriptProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const downloadAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;
    
    // Add title
    doc.setFontSize(16);
    doc.text("Interview Transcript", margin, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;
    
    // Add messages
    doc.setFontSize(10);
    
    transcript.forEach((message, index) => {
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
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transcript</CardTitle>
        <Button variant="outline" size="sm" onClick={downloadAsPDF} className="gap-1">
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div className={`space-y-4 ${isExpanded ? "" : "max-h-[400px] overflow-y-auto"}`}>
          {transcript.map((message) => (
            <div key={message.id} className="pb-2 border-b border-gray-100 last:border-0">
              <p className="text-sm font-medium mb-1">
                {message.role === 'ai' ? 'Interviewer' : 'You'}
              </p>
              <p className="text-sm text-gray-600">{message.text}</p>
            </div>
          ))}
          
          {transcript.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              The transcript will appear here as you progress through the interview.
            </p>  
          )}
        </div>
        
        {transcript.length > 5 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 w-full" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show Less" : "Show All"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
