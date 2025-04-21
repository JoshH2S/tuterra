
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type NewsTopic = Database["public"]["Enums"]["news_topic"];

export const useProfileSetup = (onComplete: () => void) => {
  const savedProgress = typeof window !== 'undefined' 
    ? localStorage.getItem('onboarding_progress') 
    : null;
  
  const initialState = savedProgress ? JSON.parse(savedProgress) : {};
  
  const [step, setStep] = useState(initialState.step || 0);
  const totalSteps = 2;
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialState.selectedTopics || []);
  const [educationLevel, setEducationLevel] = useState<string>(initialState.educationLevel || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const setWelcomeEmailSent = (userId: string) => {
    localStorage.setItem(`welcome_email_sent_${userId}`, "1");
  };
  const hasWelcomeEmailSent = (userId: string) => {
    return localStorage.getItem(`welcome_email_sent_${userId}`) === "1";
  };

  useEffect(() => {
    localStorage.setItem('onboarding_progress', JSON.stringify({
      step,
      selectedTopics,
      educationLevel
    }));
  }, [step, selectedTopics, educationLevel]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const getProgressPercentage = () => {
    let percentage = ((step - 1) / totalSteps) * 100;
    
    if (step === 1 && selectedTopics.length > 0) {
      percentage += (1 / totalSteps) * (selectedTopics.length > 3 ? 100 : (selectedTopics.length / 3) * 100);
    } else if (step === 2 && educationLevel) {
      percentage += (1 / totalSteps) * 100;
    }
    
    return Math.min(percentage, 100);
  };

  const getProgressMessage = () => {
    const progressPercentage = getProgressPercentage();
    
    if (progressPercentage < 30) return "Just getting started";
    if (progressPercentage < 60) return "Making progress";
    if (progressPercentage < 90) return "Almost there";
    return "Ready to complete!";
  };

  const isCurrentStepValid = () => {
    if (step === 0) return true;
    if (step === 1) return selectedTopics.length > 0;
    if (step === 2) return !!educationLevel;
    return false;
  };

  const handleComplete = async () => {
    if (!educationLevel) {
      toast({
        title: "Please select an education level",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First get the user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get the session separately
      const { data: { session } } = await supabase.auth.getSession();

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            school: educationLevel,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        if (selectedTopics.length > 0) {
          const typedTopics = selectedTopics.filter(topic => 
            [
              'business_economics',
              'political_science_law',
              'science_technology',
              'healthcare_medicine',
              'engineering_applied_sciences',
              'arts_humanities_social_sciences',
              'education',
              'mathematics_statistics',
              'industry_specific',
              'cybersecurity_it'
            ].includes(topic)
          ) as NewsTopic[];

          const { error: topicsError } = await supabase
            .from('user_news_preferences')
            .upsert({
              user_id: user.id,
              topics: typedTopics,
            });

          if (topicsError) throw topicsError;
        }

        toast({
          title: "Profile setup complete!",
          description: "Your preferences have been saved.",
        });

        // Check if welcome email needs to be sent
        if (!hasWelcomeEmailSent(user.id)) {
          // Make sure the session is available
          if (!session?.access_token) {
            console.warn("[WelcomeEmail] No session access token available, refreshing session");
            await supabase.auth.refreshSession();
            const { data: { session: refreshedSession } } = await supabase.auth.getSession();
            
            if (refreshedSession?.access_token) {
              await sendWelcomeEmail(user, refreshedSession);
            } else {
              console.error("[WelcomeEmail] Still no session token after refresh");
            }
          } else {
            await sendWelcomeEmail(user, session);
          }
        } else {
          console.log("[WelcomeEmail] Welcome email already sent for user:", user.id);
        }

        localStorage.removeItem('onboarding_progress');
        onComplete();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improved helper function to send welcome email
  const sendWelcomeEmail = async (user: any, session: any) => {
    if (!session?.access_token) {
      console.error("[WelcomeEmail] No access token available");
      return false;
    }

    try {
      console.log("[WelcomeEmail] Sending welcome email to:", user.email);
      
      const firstName = 
        (user.user_metadata && user.user_metadata.first_name) ||
        user.user_metadata?.firstName || 
        "";
      
      const { data, error } = await supabase.functions.invoke("send-welcome-email", {
        body: {
          email: user.email,
          firstName: firstName,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(`Error calling function: ${error.message}`);
      }

      console.log("[WelcomeEmail] Response:", data);

      if (data?.status === 'success') {
        setWelcomeEmailSent(user.id);
        console.log("[WelcomeEmail] Successfully sent welcome email for user:", user.id);
        return true;
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (e) {
      console.error("[WelcomeEmail] Failed to send welcome email:", e);
      
      // Notify user but don't block the onboarding flow
      toast({
        title: "Welcome Email",
        description: "We'll send you a welcome email shortly.",
        variant: "default",
      });
      
      return false;
    }
  };

  return {
    step,
    totalSteps,
    selectedTopics,
    setSelectedTopics,
    educationLevel,
    setEducationLevel,
    isSubmitting,
    handleNext,
    handleBack,
    getProgressPercentage,
    getProgressMessage,
    isCurrentStepValid,
    handleComplete
  };
};
