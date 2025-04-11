
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
      console.log('No user found, cannot fetch credits');
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Fetching credits for user:', user.id);
      
      // Using 'any' to bypass the type checking since we know user_credits exists in the database
      const { data, error: fetchError } = await (supabase as any)
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }

      console.log('Credits data from Supabase:', data);

      // If no data is found, create a fallback with default values
      if (!data) {
        console.log('No credits found, using fallback values');
        
        // Try to create default credits for the user
        try {
          const { data: newCredits, error: insertError } = await (supabase as any)
            .from('user_credits')
            .insert({
              user_id: user.id,
              quiz_credits: 5,
              interview_credits: 1,
              assessment_credits: 1,
              tutor_message_credits: 5
            })
            .select('*')
            .single();
            
          if (insertError) {
            console.error('Error creating default credits:', insertError);
            throw insertError;
          }
          
          if (newCredits) {
            console.log('Created new credits record:', newCredits);
            setCredits(newCredits as UserCredits);
          } else {
            // Fallback if insert doesn't return data
            useDefaultCredits(user.id);
          }
        } catch (insertErr) {
          console.error('Failed to create default credits:', insertErr);
          // Use fallback values if insert fails
          useDefaultCredits(user.id);
        }
      } else {
        console.log('Found existing credits:', data);
        setCredits(data as UserCredits);
      }
    } catch (err) {
      console.error('Error fetching user credits:', err);
      setError('Failed to load your available credits');
      
      // Provide fallback credits so UI doesn't break
      useDefaultCredits(user?.id || 'unknown');
      
      // Only show toast if it's a real error, not just missing data
      if (err instanceof Error && err.message !== 'No data found') {
        toast({
          title: "Error",
          description: "Failed to load your available credits. Using default values.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const useDefaultCredits = (userId: string) => {
    setCredits({
      id: 'fallback',
      user_id: userId,
      quiz_credits: 5,
      interview_credits: 1,
      assessment_credits: 1,
      tutor_message_credits: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
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

      console.log(`Decrementing ${creditType} for user ${user.id}`);

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

      console.log(`Successfully decremented ${creditType}`);
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
    if (user) {
      fetchUserCredits();
    } else {
      setLoading(false);
      setCredits(null);
    }
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
