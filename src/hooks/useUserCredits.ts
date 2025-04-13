
import { useState, useEffect, useCallback } from 'react';
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

// Default credits values used when API calls fail
const DEFAULT_CREDITS = {
  quiz_credits: 5,
  interview_credits: 1,
  assessment_credits: 1,
  tutor_message_credits: 5
};

export const useUserCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<boolean>(false);

  const useDefaultCredits = (userId: string) => {
    console.log('Using default credits as fallback');
    setCredits({
      id: 'fallback',
      user_id: userId,
      ...DEFAULT_CREDITS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  };

  const fetchUserCredits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      console.log('No user found, cannot fetch credits');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPermissionError(false);
      
      console.log('Fetching credits for user:', user.id);
      
      // Try to fetch credits from Supabase
      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        // Check if this is a permission error
        if (fetchError.code === '42501' || fetchError.message.includes('permission denied') || 
            fetchError.code === '403' || fetchError.status === 403) {
          console.warn('Permission error fetching credits:', fetchError);
          setPermissionError(true);
          useDefaultCredits(user.id);
          return;
        }
        
        console.error('Supabase error fetching credits:', fetchError);
        throw fetchError;
      }

      console.log('Credits data from Supabase:', data);

      // If no data is found, create a fallback with default values
      if (!data) {
        console.log('No credits found, creating default credits');
        
        // Try to create default credits for the user
        try {
          const { data: newCredits, error: insertError } = await supabase
            .from('user_credits')
            .insert({
              user_id: user.id,
              ...DEFAULT_CREDITS
            })
            .select('*')
            .single();
            
          if (insertError) {
            // If insert fails due to permission issues, use fallback
            if (insertError.code === '42501' || insertError.code === '403' || 
                insertError.message.includes('permission denied') || insertError.status === 403) {
              console.warn('Permission denied when creating credits, using fallback', insertError);
              setPermissionError(true);
              useDefaultCredits(user.id);
              return;
            }
            
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
      if (err instanceof Error && err.message !== 'No data found' && !permissionError) {
        toast({
          title: "Limited Functionality",
          description: "Using offline mode for credits. Some features may be limited.",
          variant: "default",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, permissionError]);

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

      // Only attempt to update in Supabase if we don't have permission errors
      if (!permissionError) {
        const { error } = await supabase
          .from('user_credits')
          .update({ [creditType]: credits[creditType] - 1 })
          .eq('user_id', user.id);
  
        if (error) {
          // If update fails due to RLS policies, update locally only
          if (error.code === '42501' || error.code === '403' || 
              error.message.includes('permission denied') || error.status === 403) {
            console.warn('Permission denied when updating credits, updating locally only', error);
            setPermissionError(true);
          } else {
            throw error;
          }
        }
      }

      // Always update local state - especially important if Supabase update failed
      setCredits({
        ...credits,
        [creditType]: credits[creditType] - 1,
        updated_at: new Date().toISOString(),
      });

      console.log(`Successfully decremented ${creditType}, remaining: ${credits[creditType] - 1}`);
      return true;
    } catch (err) {
      console.error(`Error decrementing ${creditType}:`, err);
      
      // Only notify user if it's not a permission error that we can handle silently
      if (!permissionError) {
        toast({
          title: 'Working Offline',
          description: `Using offline mode for credits. Your usage will be tracked locally.`,
          variant: 'default',
        });
      }
      
      // Still update local state so that the user experience isn't interrupted
      if (credits[creditType] > 0) {
        setCredits({
          ...credits,
          [creditType]: credits[creditType] - 1,
          updated_at: new Date().toISOString(),
        });
        return true;
      }
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
  }, [user, fetchUserCredits]);

  return {
    credits,
    loading,
    error,
    permissionError,
    decrementCredits,
    checkCredits,
    fetchUserCredits,
  };
};
