
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface UserCredits {
  quiz_credits: number;
  interview_credits: number;
  assessment_credits: number;
  [key: string]: number;
}

export const useUserCredits = () => {
  const [credits, setCredits] = useState<UserCredits>({
    quiz_credits: 5,
    interview_credits: 2,
    assessment_credits: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const fetchingCredits = useRef(false);
  const [pendingTransactions, setPendingTransactions] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user credits from the database with improved error handling and race condition prevention
  const fetchUserCredits = useCallback(async () => {
    // Don't fetch if already fetching
    if (fetchingCredits.current) return;
    
    try {
      fetchingCredits.current = true;
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();

      // If there's no user session, use default credits
      if (!session || !session.user) {
        setCredits({
          quiz_credits: 5,
          interview_credits: 2,
          assessment_credits: 2
        });
        setIsOfflineMode(true);
        return;
      }

      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (creditsError) {
        console.error("Error fetching user credits:", creditsError);
        setError(creditsError);
        setIsOfflineMode(true);
      }
      
      // Set credits and clear errors
      if (creditsData) {
        // Convert DB data to our UserCredits type
        setCredits({
          quiz_credits: creditsData.quiz_credits,
          interview_credits: creditsData.interview_credits,
          assessment_credits: creditsData.assessment_credits
        });
        setError(null);
        setIsOfflineMode(false);
      } else {
        console.warn("No credits found for user, using defaults");
        setCredits({
          quiz_credits: 5,
          interview_credits: 2,
          assessment_credits: 2
        });
        setIsOfflineMode(true);
      }
      
    } catch (error: any) {
      console.error("Unexpected error fetching user credits:", error);
      setError(error);
      setIsOfflineMode(true);
      toast({
        title: "Error fetching credits",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Always reset the fetchingCredits flag, even if an error occurred
      // This prevents the user from being stuck with stale credits
      fetchingCredits.current = false;
    }
  }, [toast]);

  // Check if user has enough credits with improved validation
  const checkCredits = async (creditType: string): Promise<boolean> => {
    if (!creditType) {
      console.error("Credit type is required");
      return false;
    }

    if (isOfflineMode) {
      console.log("Offline mode: Skipping credit check");
      return true;
    }

    if (!credits) {
      console.warn("Credits not loaded, please try again");
      await fetchUserCredits(); // Try to fetch credits again
      return false;
    }

    if (credits[creditType] === undefined) {
      console.warn(`Credit type "${creditType}" not found`);
      return false;
    }

    return credits[creditType] > 0;
  };

  // Decrement credits function with improved state synchronization
  const decrementCredits = async (creditType: string): Promise<boolean> => {
    if (!creditType) {
      console.error("Credit type is required");
      return false;
    }

    // Don't decrement credits in offline mode or for premium users
    if (isOfflineMode) {
      console.log("Offline mode: Skipping credit decrement");
      toast({
        title: "Offline Mode",
        description: "Credits cannot be decremented in offline mode.",
      });
      return true;
    }

    try {
      setPendingTransactions(prev => ({ ...prev, [creditType]: true }));

      // Optimistic UI update - update local state immediately
      // This will be reset if the server update fails
      const previousCredits = { ...credits };
      setCredits(prev => ({
        ...prev,
        [creditType]: Math.max(0, prev[creditType] - 1)
      }));

      const { data, error } = await supabase
        .from('user_credits')
        .update({ [creditType]: Math.max(0, credits[creditType] - 1) })
        .eq('user_id', user?.id)
        .select();

      if (error) {
        // Revert to previous state if update fails
        setCredits(previousCredits);
        console.error("Error decrementing credit:", error);
        toast({
          title: "Credit decrement failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data && data[0]) {
        // Update the local credits state with server response
        // This ensures UI matches backend state
        const updatedValue = data[0][creditType];
        
        // Only update the specific credit that changed
        setCredits(prev => ({
          ...prev,
          [creditType]: updatedValue
        }));
        
        toast({
          title: "Credit used",
          description: `1 ${creditType.replace('_credits', '')} credit has been used.`,
        });
        return true;
      } else {
        // If no data was returned, revert to previous state
        setCredits(previousCredits);
        console.error("No data returned from update operation");
        return false;
      }
    } catch (error: any) {
      console.error("Unexpected error decrementing credit:", error);
      toast({
        title: "Credit decrement failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setPendingTransactions(prev => ({ ...prev, [creditType]: false }));
    }
  };
  
  // Retry fetching credits
  const retryFetch = async (): Promise<void> => {
    setError(null);
    await fetchUserCredits();
    return;
  };

  useEffect(() => {
    // Initialize by fetching credits
    fetchUserCredits();
  }, [fetchUserCredits]);

  return {
    credits,
    loading,
    error,
    isOfflineMode,
    checkCredits,
    decrementCredits,
    fetchUserCredits,
    pendingTransactions,
    retryFetch
  };
};
