
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptDownloadProps {
  transcript: Array<{ role: 'ai' | 'user'; text: string }>;
  fileName?: string;
}

export const TranscriptDownload = ({ transcript, fileName = "interview-transcript" }: TranscriptDownloadProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const formatTranscript = (format: 'txt' | 'pdf') => {
    const formattedText = transcript
      .map(msg => `${msg.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${msg.text}`)
      .join('\n\n');

    if (format === 'txt') {
      return formattedText;
    } else {
      return `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              .interviewer { color: #2563eb; font-weight: bold; }
              .candidate { color: #1f2937; }
              .message { margin-bottom: 1em; }
            </style>
          </head>
          <body>
            ${formattedText.split('\n\n').map(msg => `
              <div class="message">
                <span class="${msg.startsWith('Interviewer') ? 'interviewer' : 'candidate'}">
                  ${msg}
                </span>
              </div>
            `).join('')}
          </body>
        </html>
      `;
    }
  };

  const downloadTranscript = async (format: 'txt' | 'pdf') => {
    try {
      setIsDownloading(true);
      const content = formatTranscript(format);
      
      if (format === 'txt') {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const { default: jsPDF } = await import('jspdf');
        const html2canvas = await import('html2canvas').then(module => module.default);
        
        const element = document.createElement('div');
        element.innerHTML = content;
        document.body.appendChild(element);
        
        const canvas = await html2canvas(element);
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
        
        document.body.removeChild(element);
      }
      
      toast({
        title: "Success",
        description: `Transcript downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error downloading transcript:', error);
      toast({
        title: "Error",
        description: "Failed to download transcript. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadTranscript('txt')}
        disabled={isDownloading}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Download TXT
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadTranscript('pdf')}
        disabled={isDownloading}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
};
