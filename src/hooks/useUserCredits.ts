
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export type UserCredits = {
  id: string;
  user_id: string;
  quiz_credits: number;
  interview_credits: number;
  assessment_credits: number;
  tutor_message_credits: number;
  created_at: string;
  updated_at: string;
};

export const useUserCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Using 'any' to bypass the type checking since we know user_credits exists in the database
      // This is a workaround since the Supabase types don't include our newly created table
      const { data, error } = await (supabase as any)
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setCredits(data as UserCredits);
      setError(null);
    } catch (err) {
      console.error('Error fetching user credits:', err);
      setError('Failed to load your available credits');
      toast({
        title: 'Error',
        description: 'Failed to load your available credits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const decrementCredits = async (creditType: 'quiz_credits' | 'interview_credits' | 'assessment_credits' | 'tutor_message_credits') => {
    if (!user || !credits) return false;

    try {
      if (credits[creditType] <= 0) {
        toast({
          title: 'No credits remaining',
          description: 'You have used all your free credits. Please upgrade to continue.',
          variant: 'destructive',
        });
        return false;
      }

      // Using 'any' to bypass the type checking
      const { error } = await (supabase as any)
        .from('user_credits')
        .update({ [creditType]: credits[creditType] - 1 })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setCredits({
        ...credits,
        [creditType]: credits[creditType] - 1,
        updated_at: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error(`Error decrementing ${creditType}:`, err);
      toast({
        title: 'Error',
        description: `Failed to update your ${creditType.replace('_', ' ')}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const checkCredits = (creditType: 'quiz_credits' | 'interview_credits' | 'assessment_credits' | 'tutor_message_credits'): boolean => {
    if (!credits) return false;
    return credits[creditType] > 0;
  };

  useEffect(() => {
    fetchUserCredits();
  }, [user]);

  return {
    credits,
    loading,
    error,
    decrementCredits,
    checkCredits,
    fetchUserCredits,
  };
};
