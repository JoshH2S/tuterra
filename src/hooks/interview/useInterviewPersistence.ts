
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewTranscript } from "@/types/interview";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "@/lib/uuid";

// Helper to convert image to data URL to avoid CORS issues (same as certificate)
async function convertImageToDataUrl(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('Canvas context not available, using original URL');
          resolve(url); // Fallback to original
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        console.log('Successfully converted logo to data URL for PDF');
        resolve(dataUrl);
      } catch (error) {
        console.warn('Failed to convert image, using original:', error);
        resolve(url); // Fallback to original
      }
    };
    
    img.onerror = () => {
      console.warn('Failed to load image, using original URL');
      resolve(url); // Fallback to original
    };
    
    img.src = url;
  });
}

export const useInterviewPersistence = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createSession = async (industry: string, jobRole: string, jobDescription: string) => {
    // Input validation
    if (!industry || !jobRole) {
      console.error("Missing required parameters for session creation", { industry, jobRole });
      toast({
        title: "Missing Information",
        description: "Industry and job role are required to create an interview session.",
        variant: "destructive",
      });
      return null;
    }
    
    // Generate a client-side UUID for session tracking
    let clientSessionId;
    try {
      clientSessionId = uuidv4();
      if (!clientSessionId || typeof clientSessionId !== 'string' || clientSessionId.trim() === '' || !clientSessionId.includes('-')) {
        throw new Error("Failed to generate a valid client session ID");
      }
      
      console.log(`Created valid client session ID: ${clientSessionId}`);
    } catch (uuidError) {
      console.error("UUID generation error:", uuidError);
      // Create a timestamp-based fallback ID if UUID generation fails
      clientSessionId = `fallback-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      console.log(`Using fallback client session ID: ${clientSessionId}`);
      
      toast({
        title: "Session ID Issue",
        description: "Created a fallback session ID. The interview will continue in offline mode.",
        variant: "destructive",
      });
      
      return clientSessionId;
    }
    
    setLoading(true);
    
    try {
      // Use the edge function to create a session
      console.log("Calling create-interview-session edge function...");
      
      const { data, error } = await supabase.functions.invoke('create-interview-session', {
        body: {
          sessionId: clientSessionId,
          industry,
          role: jobRole, // Maps to job_title in the DB
          jobDescription
        }
      });

      // Add proper error handling
      if (error || !data?.success) {
        console.error("Edge function error:", { error, data });
        throw new Error(error?.message || 'Failed to create session');
      }
      
      // Only return the database ID if we got a successful response
      // This is now correctly treated as the primary key of the interview_sessions table
      if (data?.success && data?.id) {
        console.log("Session created successfully:", { 
          databaseId: data.id,
          clientSessionId
        });
        
        // Add a small delay to ensure session propagation before generating questions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return data.id;
      }
      
      throw new Error("Invalid response from create-interview-session");
      
    } catch (error) {
      console.error("Error creating session:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Connection Issue",
        description: errorMessage.includes('network') || errorMessage.includes('connect') 
          ? "Failed to connect to interview service. Using offline mode."
          : "Failed to create interview session. Using offline mode.",
        variant: "destructive",
      });
      
      // Return the client session ID anyway so the interview can continue with local questions
      return clientSessionId;
    } finally {
      setLoading(false);
    }
  };
  
  const downloadTranscript = async (transcript: InterviewTranscript[], jobTitle: string, format: 'txt' | 'pdf') => {
    if (transcript.length === 0) {
      toast({
        title: "No transcript available",
        description: "Complete the interview to generate a transcript.",
        variant: "destructive",
      });
      return;
    }
    
    const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
    const filename = `interview-${jobTitle.toLowerCase().replace(/\s+/g, '-')}-${dateStr}`;
    
    if (format === 'txt') {
      let textContent = `Interview Transcript for ${jobTitle} Position\n`;
      textContent += `Date: ${new Date().toLocaleDateString()}\n\n`;
      
      transcript.forEach((item, index) => {
        textContent += `Question ${index + 1}: ${item.question}\n`;
        textContent += `Answer: ${item.answer}\n\n`;
      });
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add Tuterra logo (same as certificate)
      try {
        const logoUrl = '/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png';
        const logoDataUrl = await convertImageToDataUrl(logoUrl);
        
        if (logoDataUrl && logoDataUrl.startsWith('data:')) {
          // Add logo image to PDF
          pdf.addImage(logoDataUrl, 'PNG', pageWidth / 2 - 15, 8, 30, 12); // Centered logo, 30x12 size
          
          // Add decorative line below logo (same style as certificate)
          pdf.setDrawColor(30, 64, 175);
          pdf.setLineWidth(2);
          pdf.line(pageWidth / 2 - 30, 25, pageWidth / 2 + 30, 25);
        } else {
          throw new Error('Logo conversion failed');
        }
      } catch (error) {
        console.warn('Failed to add logo to PDF, using text fallback:', error);
        // Fallback to text logo
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(30, 64, 175);
        pdf.text('TUTERRA', pageWidth / 2, 20, { align: 'center' });
        
        pdf.setDrawColor(30, 64, 175);
        pdf.setLineWidth(2);
        pdf.line(pageWidth / 2 - 30, 25, pageWidth / 2 + 30, 25);
      }
      
      // Document title
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Interview Transcript for ${jobTitle} Position`, pageWidth / 2, 40, { align: 'center' });
      
      // Date and branding info
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
      pdf.text('Powered by Tuterra AI Interview Simulator', pageWidth - 20, 55, { align: 'right' });
      
      // Add separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(20, 60, pageWidth - 20, 60);
      
      let yPosition = 75;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Add questions and answers
      transcript.forEach((item, index) => {
        // Check if we need a new page (leave space for footer)
        if (yPosition > pageHeight - 60) {
          // Add footer to current page before creating new page
          addFooter(pdf, pageWidth, pageHeight);
          pdf.addPage();
          yPosition = 30; // Start lower on new pages to leave space for header
        }
        
        // Question styling
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 64, 175); // Tuterra blue for questions
        const questionText = `Question ${index + 1}: ${item.question}`;
        
        // Split long text into multiple lines
        const questionLines = pdf.splitTextToSize(questionText, 170);
        pdf.text(questionLines, 20, yPosition);
        yPosition += 7 * questionLines.length + 3;
        
        // Check if we need a new page after the question
        if (yPosition > pageHeight - 50) {
          addFooter(pdf, pageWidth, pageHeight);
          pdf.addPage();
          yPosition = 30;
        }
        
        // Answer styling
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60); // Dark gray for answers
        const answerText = `Answer: ${item.answer}`;
        const answerLines = pdf.splitTextToSize(answerText, 170);
        pdf.text(answerLines, 20, yPosition);
        
        yPosition += 7 * answerLines.length + 15; // Extra spacing between Q&A pairs
        
        // Add subtle separator line between questions
        if (index < transcript.length - 1) {
          pdf.setDrawColor(230, 230, 230);
          pdf.setLineWidth(0.3);
          pdf.line(20, yPosition - 8, pageWidth - 20, yPosition - 8);
        }
      });
      
      // Add footer to the last page
      addFooter(pdf, pageWidth, pageHeight);
      
      pdf.save(`${filename}.pdf`);
    }
    
    // Helper function to add footer
    function addFooter(pdf: any, pageWidth: number, pageHeight: number) {
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by Tuterra AI Interview Simulator', pageWidth / 2, pageHeight - 15, { align: 'center' });
      pdf.text('www.tuterra.ai', pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    toast({
      title: "Download complete",
      description: `Your transcript has been downloaded as a ${format.toUpperCase()} file.`,
    });
  };

  return {
    createSession,
    downloadTranscript,
    loading
  };
};
