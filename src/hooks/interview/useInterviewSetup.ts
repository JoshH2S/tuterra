
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";

export const useInterviewSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: sessionId } = useParams();
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const { checkCredits, decrementCredits, credits, retryFetch } = useUserCredits();
  const { subscription } = useSubscription();

  useEffect(() => {
    console.log("Interview setup credits debug:", { 
      credits,
      hasInterviewCredits: credits?.interview_credits > 0,
      currentInterviewCredits: credits?.interview_credits || 0,
      subscriptionTier: subscription?.tier
    });
  }, [credits, subscription]);

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
      interviewCreditsRemaining: credits?.interview_credits || 0,
      subscriptionTier: subscription?.tier
    });
  }, [jobTitle, industry, jobDescription, sessionId, credits, subscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submission triggered with values:", { 
      jobTitle: {
        value: `'${jobTitle}'`,
        type: typeof jobTitle,
        length: jobTitle.length,
        trimmedLength: jobTitle.trim().length,
        isValidInput: Boolean(jobTitle && jobTitle.trim().length > 0)
      },
      industry: {
        value: `'${industry}'`,
        type: typeof industry,
        length: industry.length,
        trimmedLength: industry.trim().length
      },
      interviewCreditsRemaining: credits?.interview_credits || 0,
      hasCredits: checkCredits('interview_credits'),
      subscriptionTier: subscription?.tier
    });
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the interview simulator",
        variant: "destructive",
      });
      return;
    }

    // Only check credits for free tier users
    if (subscription.tier === 'free') {
      await retryFetch();

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
    }

    // Enhanced job title validation
    if (!jobTitle) {
      console.error("jobTitle validation failure: null or undefined value");
      toast({
        title: "Invalid Job Title",
        description: "Please provide a valid job title",
        variant: "destructive"
      });
      return;
    }
    
    const trimmedJobTitle = jobTitle.trim();
    if (trimmedJobTitle === "") {
      console.error("jobTitle validation failure:", {
        jobTitleRaw: `'${jobTitle}'`,
        jobTitleType: typeof jobTitle,
        jobTitleTrimmed: trimmedJobTitle,
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
        jobTitle: trimmedJobTitle,
        industry: industry.trim(),
        descriptionLength: jobDescription.length,
        interviewCreditsRemaining: credits?.interview_credits || 0,
        subscriptionTier: subscription?.tier
      });

      const { data: session, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_title: trimmedJobTitle,
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
        
        // Only decrement credits for free tier users
        if (subscription.tier === 'free') {
          const decrementSuccess = await decrementCredits('interview_credits');
          console.log("Decrement credits result:", { 
            decrementSuccess, 
            newCreditsRemaining: (credits?.interview_credits || 0) - 1,
            subscriptionTier: subscription?.tier
          });
          
          if (!decrementSuccess) {
            console.warn("Failed to decrement credits, but continuing with interview");
          }
        } else {
          console.log("Skip credit decrement for paid user:", subscription.tier);
        }
        
        try {
          console.log(`Fetching or generating questions for session: ${session.id}`);
          
          navigate(`/interview/${session.id}`, { 
            state: { 
              sessionId: session.id,
              jobTitle: trimmedJobTitle,
              industry: industry.trim(),
              jobDescription: jobDescription
            }
          });
        } catch (fetchError) {
          console.error("Error generating questions:", fetchError);
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
