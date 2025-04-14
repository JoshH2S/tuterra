
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useUserCredits";

export const useInterviewSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const { checkCredits, decrementCredits } = useUserCredits();

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("Interview setup state:", { jobTitle, industry, jobDescription });
  }, [jobTitle, industry, jobDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submitting interview setup with values:", { 
      jobTitle, 
      industry,
      jobDescription: jobDescription.substring(0, 50) + "..."
    });
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the interview simulator",
        variant: "destructive",
      });
      return;
    }

    // Check if user has interview credits
    if (!checkCredits('interview_credits')) {
      setShowUpgradePrompt(true);
      toast({
        title: "No credits remaining",
        description: "You have used all your free interview simulation credits. Please upgrade to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields with explicit logging
    if (!jobTitle.trim()) {
      console.error("Job title is missing or empty");
      toast({
        title: "Required field missing",
        description: "Please provide a job title",
        variant: "destructive",
      });
      return;
    }

    if (!industry.trim()) {
      console.error("Industry is missing or empty");
      toast({
        title: "Required field missing",
        description: "Please select an industry",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Creating interview session with:", {
        role: jobTitle,
        industry: industry,
        description: jobDescription
      });

      // Create a new interview session
      const { data: session, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_title: jobTitle,
          industry: industry,
          job_description: jobDescription,
          status: "created",
        })
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      if (session) {
        console.log("Session created successfully:", session);
        // Decrement interview credits
        await decrementCredits('interview_credits');
        navigate(`/interview/${session.id}`);
      }
    } catch (error) {
      console.error("Failed to create interview session:", error);
      toast({
        title: "Failed to start interview",
        description: "There was an error starting your interview simulation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    jobTitle,
    setJobTitle,
    industry,
    setIndustry,
    jobDescription,
    setJobDescription,
    loading,
    showUpgradePrompt,
    setShowUpgradePrompt,
    handleSubmit,
  };
};
