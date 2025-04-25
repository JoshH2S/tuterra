
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface UserCredits {
  interview_credits: number;
  quiz_credits: number;
  assessment_credits: number;
  [key: string]: number;
}

export const useUserCredits = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserCredits = async () => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      setCredits(data || {
        interview_credits: 0,
        quiz_credits: 0,
        assessment_credits: 0,
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkCredits = async (creditType: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const userCredits = credits || await fetchUserCredits();
      
      if (!userCredits) return false;
      
      return userCredits[creditType] > 0;
    } catch (error) {
      console.error('Error checking credits:', error);
      return false;
    }
  };

  const decrementCredits = async (creditType: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const userCredits = credits || await fetchUserCredits();
      
      if (!userCredits || userCredits[creditType] <= 0) {
        toast({
          title: "No credits available",
          description: `You don't have any ${creditType.replace('_', ' ')} remaining.`,
          variant: "destructive",
        });
        return false;
      }
      
      const { error } = await supabase.rpc('decrement_user_credit', {
        credit_type: creditType,
        user_id: user.id
      });
      
      if (error) throw error;
      
      // Update local state
      setCredits(prev => prev ? {
        ...prev,
        [creditType]: Math.max(0, (prev[creditType] || 0) - 1)
      } : null);
      
      return true;
    } catch (error) {
      console.error('Error decrementing credits:', error);
      toast({
        title: "Error",
        description: "Failed to update credits. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserCredits();
    } else {
      setCredits(null);
    }
  }, [user]);

  const retryFetch = fetchUserCredits;

  return {
    credits,
    loading,
    checkCredits,
    decrementCredits,
    fetchUserCredits,
    retryFetch
  };
};
