
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InterviewSession, InterviewTranscript } from "@/types/interview";
import { jsPDF } from "jspdf";

export const useInterviewPersistence = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createSession = async (industry: string, jobRole: string, jobDescription: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          industry,
          role: jobRole, // Note: using 'role' instead of 'job_role' to match DB schema
          job_description: jobDescription
        })
        .select()
        .single();

      if (error) throw error;
      
      return data?.id || null;
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create interview session. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async (sessionId: string): Promise<InterviewSession | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      
      if (data) {
        // Map the returned data to our InterviewSession interface
        const session: InterviewSession = {
          id: data.id,
          user_id: data.user_id,
          industry: data.industry,
          job_role: data.role, // Map 'role' from DB to 'job_role' in our interface
          job_description: data.job_description,
          created_at: data.created_at,
          updated_at: data.created_at // Use created_at as updated_at if missing
        };
        return session;
      }
      return null;
    } catch (error) {
      console.error("Error fetching session:", error);
      toast({
        title: "Error",
        description: "Failed to fetch interview session. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const downloadTranscript = (
    transcript: InterviewTranscript[], 
    jobRole: string, 
    format: 'txt' | 'pdf' = 'pdf'
  ) => {
    try {
      if (transcript.length === 0) {
        toast({
          title: "Error",
          description: "No transcript available to download.",
          variant: "destructive",
        });
        return;
      }

      const filename = `Interview_${jobRole.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
      
      if (format === 'txt') {
        let content = `Job Interview Transcript for ${jobRole}\n\n`;
        content += `Date: ${new Date().toLocaleDateString()}\n\n`;
        
        transcript.forEach((item, index) => {
          content += `Q${index + 1}: ${item.question}\n`;
          content += `A: ${item.answer}\n\n`;
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text(`Job Interview Transcript for ${jobRole}`, 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
        
        let yPos = 40;
        const lineHeight = 7;
        
        transcript.forEach((item, index) => {
          doc.setFont(undefined, 'bold');
          // Check if adding this content would exceed page height
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`Q${index + 1}: ${item.question}`, 20, yPos);
          yPos += lineHeight;
          
          doc.setFont(undefined, 'normal');
          
          // Handle multiline answers by wrapping text
          const splitAnswer = doc.splitTextToSize(item.answer, 170);
          splitAnswer.forEach(line => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 20, yPos);
            yPos += lineHeight;
          });
          
          yPos += lineHeight;
        });
        
        doc.save(`${filename}.pdf`);
      }
      
      toast({
        title: "Success",
        description: `Transcript downloaded as ${filename}.${format}`,
      });
    } catch (error) {
      console.error("Error downloading transcript:", error);
      toast({
        title: "Error",
        description: "Failed to download transcript. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    createSession,
    fetchSession,
    downloadTranscript,
    loading
  };
};
