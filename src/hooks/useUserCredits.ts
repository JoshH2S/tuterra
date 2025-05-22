
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface UserCredits {
  quiz_credits: number;
  interview_credits: number;
  assessment_credits: number;
  tutor_message_credits: number;
  [key: string]: number | string | undefined; // Allow string and undefined values for certain properties
}

export const useUserCredits = () => {
  const [credits, setCredits] = useState<UserCredits>({
    quiz_credits: 5,
    interview_credits: 2,
    assessment_credits: 2,
    tutor_message_credits: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const fetchingCredits = useRef(false);
  const [pendingTransactions, setPendingTransactions] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const { user, authReady } = useAuth();

  const fetchUserCredits = useCallback(async () => {
    if (fetchingCredits.current || !authReady || !user) return;
    try {
      fetchingCredits.current = true;
      setLoading(true);
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (creditsError) {
        console.error("Error fetching user credits:", creditsError);
        setError(creditsError);
        setIsOfflineMode(true);
      } else {
        // Extract only the credit fields we need for the credits state
        setCredits({
          quiz_credits: creditsData.quiz_credits,
          interview_credits: creditsData.interview_credits,
          assessment_credits: creditsData.assessment_credits,
          tutor_message_credits: creditsData.tutor_message_credits,
        });
        setIsOfflineMode(false);
      }
    } catch (err) {
      setError(err);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
      fetchingCredits.current = false;
    }
  }, [user, authReady]);

  useEffect(() => {
    if (authReady && user) {
      fetchUserCredits();
    }
  }, [authReady, user, fetchUserCredits]);

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
      await fetchUserCredits();
      return false;
    }

    if (credits[creditType] === undefined) {
      console.warn(`Credit type "${creditType}" not found`);
      return false;
    }

    // Ensure we're dealing with a number for comparison
    const creditValue = typeof credits[creditType] === 'number' ? credits[creditType] as number : 0;
    return creditValue > 0;
  };

  const decrementCredits = async (creditType: string): Promise<boolean> => {
    if (!creditType) {
      console.error("Credit type is required");
      return false;
    }

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

      const previousCredits = { ...credits };
      
      // Ensure we're working with numbers for the decrement operation
      const currentCreditValue = typeof credits[creditType] === 'number' ? 
        credits[creditType] as number : 0;
      
      setCredits(prev => ({
        ...prev,
        [creditType]: Math.max(0, currentCreditValue - 1)
      }));

      const { data, error } = await supabase
        .from('user_credits')
        .update({ [creditType]: Math.max(0, currentCreditValue - 1) })
        .eq('user_id', user?.id)
        .select();

      if (error) {
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
        const updatedValue = data[0][creditType];
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

  const retryFetch = async (): Promise<void> => {
    setError(null);
    await fetchUserCredits();
    return;
  };

  return {
    credits,
    loading,
    error,
    isOfflineMode,
    checkCredits,
    decrementCredits,
    fetchUserCredits,
    pendingTransactions,
    setPendingTransactions,
    retryFetch
  };
};
