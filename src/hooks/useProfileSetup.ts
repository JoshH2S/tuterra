import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type NewsTopic = Database["public"]["Enums"]["news_topic"];

export const useProfileSetup = (onComplete: () => void) => {
  // Always start from step 0 (welcome screen) for new sessions
  // Only load from localStorage if there's saved progress
  const savedProgress = typeof window !== 'undefined' 
    ? localStorage.getItem('onboarding_progress') 
    : null;
  
  const initialState = savedProgress ? JSON.parse(savedProgress) : {};
  
  const [step, setStep] = useState(initialState.step !== undefined ? initialState.step : 0);
  const totalSteps = 2;
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialState.selectedTopics || []);
  const [educationLevel, setEducationLevel] = useState<string>(initialState.educationLevel || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to check if welcome email has been sent
  const hasWelcomeEmailSent = async (userId: string) => {
    // First check localStorage for faster response
    if (localStorage.getItem(`welcome_email_sent_${userId}`) === "true") {
      return true;
    }
    
    // Then double-check database
    const { data: profile } = await supabase
      .from('profiles')
      .select('welcome_email_sent')
      .eq('id', userId)
      .single();
      
    return !!profile?.welcome_email_sent;
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
      // Save current progress to localStorage after advancing
      localStorage.setItem('onboarding_progress', JSON.stringify({
        step: step + 1,
        selectedTopics,
        educationLevel
      }));
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      // Save current progress to localStorage after going back
      localStorage.setItem('onboarding_progress', JSON.stringify({
        step: step - 1,
        selectedTopics,
        educationLevel
      }));
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
    console.log("handleComplete started with education level:", educationLevel);
    
    if (!educationLevel) {
      toast({
        title: "Please select an education level",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Getting current user...");
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User retrieved:", user?.id);
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      console.log("Updating profile with education level:", educationLevel);
      const { error: profileError, data: profileData } = await supabase
        .from('profiles')
        .update({
          school: educationLevel,
          onboarding_complete: true
        })
        .eq('id', user.id)
        .select();

      console.log("Profile update result:", profileError ? "Error" : "Success", profileData);
      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      if (selectedTopics.length > 0) {
        console.log("Saving selected topics:", selectedTopics);
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

        if (topicsError) {
          console.error("Topics update error:", topicsError);
          throw topicsError;
        }
        console.log("Topics saved successfully");
      }

      // Set onboarding completion flag in localStorage as a backup
      console.log("Setting localStorage backup flag");
      localStorage.setItem("onboardingComplete", "true");

      console.log("Onboarding complete! Showing success toast");
      toast({
        title: "Profile setup complete!",
        description: "Your preferences have been saved.",
      });

      console.log("Clearing temporary onboarding progress");
      localStorage.removeItem('onboarding_progress');
      
      console.log("Calling onComplete callback");
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: "Please try again later.",
        variant: "destructive",
      });
      // Reset submission state so user can try again
      setIsSubmitting(false);
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
