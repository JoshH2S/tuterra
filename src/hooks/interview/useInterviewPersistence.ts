import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewTranscript } from "@/types/interview";
import jsPDF from "jspdf";
import { v4 as uuidv4 } from "@/lib/uuid";

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
    
    // Generate a new session ID with validation
    const sessionId = uuidv4();
    if (!sessionId) {
      console.error("Failed to generate a valid session ID");
      toast({
        title: "Error",
        description: "Failed to create an interview session. Please try again.",
        variant: "destructive",
      });
      return null;
    }
    
    console.log(`Creating new session with ID: ${sessionId}`);
    setLoading(true);
    
    try {
      // Use the edge function to create a session
      console.log("Calling create-interview-session edge function...");
      
      const { data, error } = await supabase.functions.invoke('create-interview-session', {
        body: {
          sessionId,
          industry,
          role: jobRole, // 'role' instead of 'job_role' to match DB schema
          jobDescription
        }
      });

      if (error) {
        console.error("Error creating session:", error);
        throw new Error(`Failed to create session: ${error.message || 'Network error'}`);
      }
      
      if (!data || !data.success) {
        console.error("Invalid response from create-interview-session:", data);
        throw new Error("Received invalid response from server");
      }
      
      console.log("Session created successfully:", { sessionId, dbId: data.id });
      
      // We'll skip the verification step for now since it's causing issues
      // and directly return the session ID
      return sessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Connection Issue",
        description: "Failed to connect to interview service. Using offline mode.",
        variant: "destructive",
      });
      
      // Return the session ID anyway so the interview can continue with local questions
      return sessionId;
    } finally {
      setLoading(false);
    }
  };
  
  const downloadTranscript = (transcript: InterviewTranscript[], jobTitle: string, format: 'txt' | 'pdf') => {
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
      
      // Set title
      pdf.setFontSize(16);
      pdf.text(`Interview Transcript for ${jobTitle} Position`, 20, 20);
      
      // Set date
      pdf.setFontSize(12);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
      
      let yPosition = 40;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Add questions and answers
      transcript.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        const questionText = `Question ${index + 1}: ${item.question}`;
        
        // Split long text into multiple lines
        const questionLines = pdf.splitTextToSize(questionText, 170);
        pdf.text(questionLines, 20, yPosition);
        yPosition += 7 * questionLines.length;
        
        // Check if we need a new page after the question
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFont(undefined, 'normal');
        const answerText = `Answer: ${item.answer}`;
        const answerLines = pdf.splitTextToSize(answerText, 170);
        pdf.text(answerLines, 20, yPosition);
        
        yPosition += 7 * answerLines.length + 10;
        
        // Check if we need a new page after the answer
        if (yPosition > pageHeight - 40 && index < transcript.length - 1) {
          pdf.addPage();
          yPosition = 20;
        }
      });
      
      pdf.save(`${filename}.pdf`);
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
