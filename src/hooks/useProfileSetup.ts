
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

// Define the specific news topic types from the Supabase database
type NewsTopic = Database["public"]["Enums"]["news_topic"];

export const useProfileSetup = (onComplete: () => void) => {
  // Initialize state from localStorage if available to persist progress
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

  // Save progress to localStorage whenever key states change
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
    
    // Add additional progress based on selections in current step
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
    if (step === 0) return true; // Welcome step is always valid
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update profile with education level stored in school field
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            school: educationLevel,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Save topics preferences if any are selected
        if (selectedTopics.length > 0) {
          // Convert string[] to the required news_topic[] enum type
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

        // Ensure we have a valid session before navigating
        const { data: { session }} = await supabase.auth.getSession();
        if (!session) {
          // If no session exists, refresh it to ensure navigation works properly
          await supabase.auth.refreshSession();
        }

        // Clear onboarding progress from localStorage after successful completion
        localStorage.removeItem('onboarding_progress');

        // Call the completion callback after everything is successfully saved
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
