import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface UserCredits {
  quiz_credits: number;
  interview_credits: number;
  assessment_credits: number;
  tutor_message_credits: number;
  [key: string]: number;
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
  const { user } = useAuth();

  const fetchUserCredits = useCallback(async () => {
    if (fetchingCredits.current) return;
    
    try {
      fetchingCredits.current = true;
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        setCredits({
          quiz_credits: 5,
          interview_credits: 2,
          assessment_credits: 2,
          tutor_message_credits: 10
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
      
      if (creditsData) {
        setCredits({
          quiz_credits: creditsData.quiz_credits,
          interview_credits: creditsData.interview_credits,
          assessment_credits: creditsData.assessment_credits,
          tutor_message_credits: creditsData.tutor_message_credits || 10
        });
        setError(null);
        setIsOfflineMode(false);
      } else {
        console.warn("No credits found for user, using defaults");
        setCredits({
          quiz_credits: 5,
          interview_credits: 2,
          assessment_credits: 2,
          tutor_message_credits: 10
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
      fetchingCredits.current = false;
    }
  }, [toast]);

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

    return credits[creditType] > 0;
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

  useEffect(() => {
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
