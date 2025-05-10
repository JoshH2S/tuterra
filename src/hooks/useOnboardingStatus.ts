
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useOnboardingStatus = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsOnboardingComplete(false);
        setLoading(false);
        return;
      }

      try {
        // Check from database instead of localStorage
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching onboarding status:", error);
          setIsOnboardingComplete(false);
        } else {
          setIsOnboardingComplete(profile?.onboarding_complete || false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsOnboardingComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  // Function to manually update the onboarding status
  const updateOnboardingStatus = async (completed: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_complete: completed })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setIsOnboardingComplete(completed);
      return true;
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      return false;
    }
  };

  return { 
    isOnboardingComplete, 
    loading,
    updateOnboardingStatus
  };
};
