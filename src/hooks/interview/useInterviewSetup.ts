
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useUserCredits";

export const useInterviewSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: sessionId } = useParams();
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const { checkCredits, decrementCredits, credits } = useUserCredits();

  // Enhanced debug effect
  useEffect(() => {
    console.log("Interview setup state debug:", { 
      jobTitle: {
        value: `'${jobTitle}'`, 
        type: typeof jobTitle,
        length: jobTitle.length,
        trimmedLength: jobTitle.trim().length
      },
      industry: `'${industry}'`,
      jobDescriptionLength: jobDescription.length,
      currentSessionId: sessionId,
      interviewCreditsRemaining: credits?.interview_credits || 0
    });
  }, [jobTitle, industry, jobDescription, sessionId, credits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission triggered with values:", { 
      jobTitle: {
        value: `'${jobTitle}'`,
        type: typeof jobTitle,
        length: jobTitle.length,
        trimmedLength: jobTitle.trim().length,
        isValidInput: !!jobTitle && jobTitle.trim().length > 0
      },
      industry: {
        value: `'${industry}'`,
        type: typeof industry,
        length: industry.length,
        trimmedLength: industry.trim().length
      },
      interviewCreditsRemaining: credits?.interview_credits || 0
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
      console.log("No interview credits remaining, showing upgrade prompt");
      setShowUpgradePrompt(true);
      toast({
        title: "No credits remaining",
        description: "You have used all your free interview simulation credits. Please upgrade to continue.",
        variant: "destructive",
      });
      return;
    }

    // More explicit validation with detailed logging
    if (!jobTitle || !jobTitle.trim()) {
      console.error("jobTitle validation failure:", {
        jobTitleRaw: `'${jobTitle}'`,
        jobTitleType: typeof jobTitle,
        jobTitleTrimmed: jobTitle?.trim() || 'N/A',
        validationResult: 'Failed - empty or whitespace only'
      });
      
      toast({
        title: "Invalid Job Title",
        description: "Please provide a valid job title",
        variant: "destructive"
      });
      return;
    }

    if (!industry || !industry.trim()) {
      console.error("Industry validation failure:", `'${industry}'`);
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
        jobTitle: jobTitle.trim(),
        industry: industry.trim(),
        descriptionLength: jobDescription.length,
        interviewCreditsRemaining: credits?.interview_credits || 0
      });

      // Create a new interview session
      const { data: session, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_title: jobTitle.trim(),
          industry: industry.trim(),
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
        console.log("Session created successfully:", session.id);
        // Decrement interview credits
        const decrementSuccess = await decrementCredits('interview_credits');
        console.log("Decrement credits result:", { decrementSuccess, newCreditsRemaining: (credits?.interview_credits || 0) - 1 });
        
        if (!decrementSuccess) {
          // This is a fallback in case decrement fails but we want to continue anyway
          console.warn("Failed to decrement credits, but continuing with interview");
        }
        
        // Ensure questions are generated before navigation
        try {
          console.log(`Fetching or generating questions for session: ${session.id}`);
          
          // Direct navigation to the interview with session data
          navigate(`/interview/${session.id}`, { 
            state: { 
              sessionId: session.id,
              jobTitle: jobTitle.trim(),
              industry: industry.trim(),
              jobDescription: jobDescription
            }
          });
        } catch (fetchError) {
          console.error("Error generating questions:", fetchError);
          // Navigate anyway, the component will handle fallbacks
          navigate(`/interview/${session.id}`);
        }
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
