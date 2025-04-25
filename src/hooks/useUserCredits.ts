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
    interview_credits: 3,
    assessment_credits: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const fetchingCredits = useRef(false);
  const [pendingTransactions, setPendingTransactions] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const retryFetch = useRef<(() => void) | null>(null);

  // Fetch user credits from the database
  const fetchUserCredits = async () => {
    if (fetchingCredits.current) return;
    fetchingCredits.current = true;

    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();

      // If there's no user session, use default credits
      if (!session || !session.user) {
        setCredits({
          quiz_credits: 5,
          interview_credits: 3,
          assessment_credits: 2
        });
        setIsOfflineMode(true);
        return credits;
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
          interview_credits: 3,
          assessment_credits: 2
        });
        setIsOfflineMode(true);
      }

      return credits;
      
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
  };

  // Check if user has enough credits
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
      return false;
    }

    if (credits[creditType] === undefined) {
      console.warn(`Credit type "${creditType}" not found`);
      return false;
    }

    return credits[creditType] > 0;
  };

  // Decrement credits function
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

      // Call the Supabase function to decrement the credit
      const { data, error: rpcError } = await supabase.rpc(
        'decrement_user_credit',
        { credit_type: creditType }
      );

      if (rpcError) {
        console.error("Error decrementing credit:", rpcError);
        toast({
          title: "Credit decrement failed",
          description: rpcError.message,
          variant: "destructive",
        });
        return false;
      }

      if (data) {
        setCredits(prev => ({ ...prev, [creditType]: data }));
        toast({
          title: "Credit used",
          description: `1 ${creditType} credit has been used.`,
        });
        return true;
      } else {
        console.error("No data returned from decrement function");
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

  useEffect(() => {
    retryFetch.current = fetchUserCredits;
  }, [fetchUserCredits]);

  return {
    credits,
    loading,
    error,
    isOfflineMode,
    checkCredits,
    decrementCredits,
    fetchUserCredits,
    retryFetch,
    pendingTransactions
  };
};
