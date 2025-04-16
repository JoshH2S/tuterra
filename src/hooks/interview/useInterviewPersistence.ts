
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
    
    // Generate a new session ID
    let sessionId;
    try {
      sessionId = uuidv4();
      if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '' || !sessionId.includes('-')) {
        throw new Error("Failed to generate a valid session ID");
      }
      
      console.log(`Created valid session ID: ${sessionId}`);
    } catch (uuidError) {
      console.error("UUID generation error:", uuidError);
      // Create a timestamp-based fallback ID if UUID generation fails
      sessionId = `fallback-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      console.log(`Using fallback session ID: ${sessionId}`);
      
      toast({
        title: "Session ID Issue",
        description: "Created a fallback session ID. The interview will continue in offline mode.",
        variant: "destructive",
      });
      
      return sessionId;
    }
    
    setLoading(true);
    
    try {
      // Use the edge function to create a session
      console.log("Calling create-interview-session edge function...");
      
      const { data, error } = await supabase.functions.invoke('create-interview-session', {
        body: {
          sessionId,
          industry,
          role: jobRole, // We keep 'role' in the API contract but it maps to job_title in the DB
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
        console.log("Session created successfully:", { sessionId: data.id });
        
        // Add a small delay to ensure session propagation before generating questions
        await new Promise(resolve => setTimeout(resolve, 800));
        
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
