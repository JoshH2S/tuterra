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
  const [errorOccurred, setErrorOccurred] = useState(false);
  
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
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the interview simulator",
        variant: "destructive",
      });
      return;
    }

    // Reset any previous error state
    setErrorOccurred(false);

    // Validate essential fields (all should be pre-trimmed)
    if (!jobTitle) {
      toast({
        title: "Invalid Job Title",
        description: "Please provide a valid job title",
        variant: "destructive"
      });
      return;
    }

    if (!industry) {
      toast({
        title: "Required field missing",
        description: "Please select an industry",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Skip credit check for premium users
    let hasCredits = true;
    if (subscription.tier === 'free') {
      try {
        await retryFetch();
        
        // Check if user has interview credits
        hasCredits = await checkCredits('interview_credits');
        if (!hasCredits) {
          console.log("No interview credits remaining, showing upgrade prompt");
          setShowUpgradePrompt(true);
          toast({
            title: "No credits remaining",
            description: "You have used all your free interview simulation credits. Please upgrade to continue.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } catch (creditsError) {
        console.error("Error checking credits:", creditsError);
        // Continue with interview creation even if credits check fails
        console.log("Continuing despite credits check error");
        // Don't return here - allow the process to continue despite credits error
      }
    } else {
      console.log("Skipping credit check for paid user:", subscription.tier);
    }

    try {
      // Store jobTitle in a variable to ensure it's used consistently
      const finalJobTitle = jobTitle;
      
      const { data: session, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_title: finalJobTitle,
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
        console.log("Session created successfully:", session.id);
        
        // Only decrement credits for free tier users
        if (subscription.tier === 'free' && hasCredits) {
          try {
            const decrementSuccess = await decrementCredits('interview_credits');
            console.log("Decrement credits result:", { 
              decrementSuccess, 
              newCreditsRemaining: (credits?.interview_credits || 0) - 1,
              subscriptionTier: subscription?.tier
            });
            
            if (!decrementSuccess) {
              console.warn("Failed to decrement credits, but continuing with interview");
            }
          } catch (decrementError) {
            console.error("Error decrementing credits:", decrementError);
            // Continue anyway - don't block the interview due to credits issues
          }
        } else {
          console.log("Skip credit decrement for paid user or no credits check:", subscription.tier);
        }
        
        try {
          console.log(`Fetching or generating questions for session: ${session.id}`);
          
          navigate(`/interview/${session.id}`, { 
            state: { 
              sessionId: session.id,
              jobTitle: finalJobTitle,
              industry: industry,
              jobDescription: jobDescription
            }
          });
        } catch (fetchError) {
          console.error("Error generating questions:", fetchError);
          navigate(`/interview/${session.id}`);
        }
      }
    } catch (error) {
      setErrorOccurred(true);
      console.error("Failed to create interview session:", error);
      toast({
        title: "Failed to start interview",
        description: "There was an error starting your interview simulation. Please try again.",
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
    errorOccurred,
    showUpgradePrompt,
    setShowUpgradePrompt,
    handleSubmit,
  };
};
