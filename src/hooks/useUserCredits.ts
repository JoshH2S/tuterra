import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { useNetworkStatus } from './interview/useNetworkStatus';

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
  const { isOfflineMode: networkOffline, hasConnectionError } = useNetworkStatus();
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRetryTime, setLastRetryTime] = useState(0);

  const addPendingTransaction = useCallback((type: string, data: any) => {
    const transaction = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    setPendingTransactions(prev => {
      const updatedTransactions = [...prev, transaction];
      try {
        localStorage.setItem('pendingTransactions', JSON.stringify(updatedTransactions));
      } catch (e) {
        console.error('Error storing pending transactions:', e);
      }
      return updatedTransactions;
    });
    
    return transaction.id;
  }, []);

  const createDefaultCredits = useCallback((userId: string): UserCredits => {
    return {
      id: 'local-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      quiz_credits: 5,
      interview_credits: 3,
      assessment_credits: 2,
      tutor_message_credits: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }, []);

  const fetchUserCredits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      console.log('No user found, cannot fetch credits');
      return;
    }

    const now = Date.now();
    if (retryCount > 3 && now - lastRetryTime < 60000) {
      console.log('Too many retry attempts, using local credits');
      useLocalCredits(user.id);
      setLoading(false);
      return;
    }

    setRetryCount(prev => prev + 1);
    setLastRetryTime(now);

    if (networkOffline || hasConnectionError) {
      console.log('Network offline or connection errors, using local credits');
      setIsOfflineMode(true);
      useLocalCredits(user.id);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching credits for user:', user.id);

      const { data, error: fetchError } = await (supabase as any)
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase error fetching credits:', fetchError);

        const errorIsPermissionDenied = 
          fetchError.code === '42501' || 
          fetchError.message.includes('permission denied') || 
          (fetchError as any).code === 'PGRST301' || 
          fetchError.message.includes('403');

        if (errorIsPermissionDenied) {
          console.log('Permission denied when fetching credits, using offline mode');
          setIsOfflineMode(true);
          useLocalCredits(user.id);
          return;
        }

        throw fetchError;
      }

      console.log('Credits data from Supabase:', data);

      if (!data) {
        console.log('No credits found for user, attempting to create default credits');

        try {
          const newCreditsData = createDefaultCredits(user.id);

          const { data: newCredits, error: insertError } = await (supabase as any)
            .from('user_credits')
            .insert({
              user_id: user.id,
              quiz_credits: newCreditsData.quiz_credits,
              interview_credits: newCreditsData.interview_credits,
              assessment_credits: newCreditsData.assessment_credits,
              tutor_message_credits: newCreditsData.tutor_message_credits
            })
            .select('*')
            .single();
            
          if (insertError) {
            console.error('Error creating default credits:', insertError);

            if (insertError.code === '42501' || insertError.message.includes('violates row-level security policy')) {
              console.warn('RLS policy error when creating credits, this may be a permissions issue');
              setIsOfflineMode(true);
              
              addPendingTransaction('createCredits', { 
                userId: user.id, 
                credits: newCreditsData 
              });
              
              useLocalCredits(user.id);
              
              toast({
                title: "Using Offline Mode",
                description: "Your credits will sync when connection is restored.",
                variant: "default",
              });
              
              return;
            }

            if (insertError.message.includes('permission denied')) {
              console.log('Permission denied when creating credits, using offline mode');
              setIsOfflineMode(true);
              useLocalCredits(user.id);
              return;
            }

            throw insertError;
          }

          if (newCredits) {
            console.log('Created new credits record:', newCredits);
            setCredits(newCredits as UserCredits);
            setIsOfflineMode(false);
            
            storeLocalCredits(newCredits);
          } else {
            useLocalCredits(user.id);
            setIsOfflineMode(true);
          }
        } catch (insertErr) {
          console.error('Failed to create default credits:', insertErr);
          useLocalCredits(user?.id || 'unknown');
          setIsOfflineMode(true);
        }
      } else {
        console.log('Found existing credits:', data);
        
        setCredits(data as UserCredits);
        setIsOfflineMode(false);
        
        storeLocalCredits(data);
      }
    } catch (err) {
      console.error('Error fetching user credits:', err);
      setError('Failed to load your available credits');
      
      useLocalCredits(user?.id || 'unknown');
      setIsOfflineMode(true);
      
      if (err instanceof Error && err.message !== 'No data found') {
        toast({
          title: "Using Offline Mode",
          description: "Your credits will sync when connection is restored.",
          variant: "default",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, networkOffline, hasConnectionError, retryCount, lastRetryTime, createDefaultCredits, addPendingTransaction]);

  const storeLocalCredits = (creditsData: UserCredits) => {
    try {
      localStorage.setItem(`local_credits_${creditsData.user_id}`, JSON.stringify(creditsData));
      console.log('Stored credits in local storage:', creditsData);
    } catch (e) {
      console.error('Error storing credits locally:', e);
    }
  };

  const useLocalCredits = (userId: string) => {
    const storedCredits = localStorage.getItem(`local_credits_${userId}`);
    if (storedCredits) {
      try {
        const parsedCredits = JSON.parse(storedCredits);
        console.log('Using stored local credits:', parsedCredits);
        setCredits(parsedCredits);
        return;
      } catch (e) {
        console.error('Error parsing stored local credits:', e);
      }
    }
    
    const defaultCredits = createDefaultCredits(userId);
    console.log('Using default local credits:', defaultCredits);
    setCredits(defaultCredits);
    
    storeLocalCredits(defaultCredits);
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

      if (isOfflineMode || networkOffline || hasConnectionError) {
        console.log(`Network issue detected: updating ${creditType} locally only`);
        
        const updatedCredits = {
          ...credits,
          [creditType]: credits[creditType] - 1,
          updated_at: new Date().toISOString(),
        };
        
        setCredits(updatedCredits);
        storeLocalCredits(updatedCredits);
        
        addPendingTransaction('decrementCredits', { creditType, userId: user.id });
        
        toast({
          title: "Offline Mode",
          description: "Using offline mode for credits. Changes will sync when you reconnect.",
          variant: "default",
        });
        
        return true;
      }

      console.log(`Decrementing ${creditType} for user ${user.id}`);

      const { error } = await (supabase as any)
        .from('user_credits')
        .update({ [creditType]: credits[creditType] - 1 })
        .eq('user_id', user.id);

      if (error) {
        const errorIsPermissionDenied = 
          error.code === '42501' || 
          error.message.includes('permission denied') || 
          (error as any).code === 'PGRST301' || 
          error.message.includes('403');
        
        if (errorIsPermissionDenied) {
          console.log('Permission denied when updating credits, updating locally only');
          setIsOfflineMode(true);
          
          const updatedCredits = {
            ...credits,
            [creditType]: credits[creditType] - 1,
            updated_at: new Date().toISOString(),
          };
          
          setCredits(updatedCredits);
          storeLocalCredits(updatedCredits);
          
          addPendingTransaction('decrementCredits', { creditType, userId: user.id });
          
          toast({
            title: "Offline Mode",
            description: "Using offline mode for credits. Changes will sync when you reconnect.",
            variant: "default",
          });
          
          return true;
        }
        
        throw error;
      }

      const updatedCredits = {
        ...credits,
        [creditType]: credits[creditType] - 1,
        updated_at: new Date().toISOString(),
      };
      
      setCredits(updatedCredits);
      storeLocalCredits(updatedCredits);

      console.log(`Successfully decremented ${creditType}, remaining: ${credits[creditType] - 1}`);
      return true;
    } catch (err) {
      console.error(`Error decrementing ${creditType}:`, err);
      
      setIsOfflineMode(true);
      
      const updatedCredits = {
        ...credits,
        [creditType]: credits[creditType] - 1,
        updated_at: new Date().toISOString(),
      };
      
      setCredits(updatedCredits);
      storeLocalCredits(updatedCredits);
      
      addPendingTransaction('decrementCredits', { creditType, userId: user.id });
      
      toast({
        title: 'Network Error',
        description: `Continued in offline mode. Changes will sync when connection is restored.`,
        variant: 'default',
      });
      
      return true;
    }
  };

  const checkCredits = (creditType: 'quiz_credits' | 'interview_credits' | 'assessment_credits' | 'tutor_message_credits'): boolean => {
    if (!credits) return false;
    
    console.log(`Checking ${creditType}:`, {
      available: credits[creditType],
      hasCredits: credits[creditType] > 0
    });
    
    return credits[creditType] > 0;
  };

  const syncCreditsWithServer = async () => {
    if (!user || !credits || !pendingTransactions.length) return;
    
    if (networkOffline || hasConnectionError) return;
    
    console.log('Attempting to sync pending transactions with server');
    
    try {
      const { data, error } = await (supabase as any)
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking server credits during sync:', error);
        return;
      }
      
      const transactionsToProcess = [...pendingTransactions];
      let successfulSyncs = 0;
      
      for (const transaction of transactionsToProcess) {
        if (transaction.type === 'decrementCredits') {
          const { creditType } = transaction.data;
          
          if (data) {
            try {
              const { error: updateError } = await (supabase as any)
                .from('user_credits')
                .update({ 
                  [creditType]: data[creditType] - 1,
                  updated_at: new Date().toISOString() 
                })
                .eq('user_id', user.id);
                
              if (!updateError) {
                successfulSyncs++;
                
                setPendingTransactions(prev => 
                  prev.filter(t => t.id !== transaction.id)
                );
              }
            } catch (e) {
              console.error('Error syncing transaction:', e);
            }
          } else {
            try {
              const { error: insertError } = await (supabase as any)
                .from('user_credits')
                .insert({
                  user_id: user.id,
                  ...credits
                });
                
              if (!insertError) {
                successfulSyncs++;
                
                setPendingTransactions([]);
              }
            } catch (e) {
              console.error('Error creating credits during sync:', e);
            }
          }
        }
      }
      
      if (successfulSyncs > 0) {
        console.log(`Successfully synced ${successfulSyncs} transactions`);
        setIsOfflineMode(false);
        
        try {
          localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));
        } catch (e) {
          console.error('Error updating pending transactions in storage:', e);
        }
        
        fetchUserCredits();
        
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${successfulSyncs} offline transactions.`,
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error during credits sync:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserCredits();
      
      try {
        const storedTransactions = localStorage.getItem('pendingTransactions');
        if (storedTransactions) {
          setPendingTransactions(JSON.parse(storedTransactions));
        }
      } catch (e) {
        console.error('Error loading pending transactions:', e);
      }
    } else {
      setLoading(false);
      setCredits(null);
    }
    
    const handleOnline = () => {
      console.log('Browser went online, attempting to sync credits');
      setTimeout(() => {
        syncCreditsWithServer();
      }, 2000);
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user, fetchUserCredits]);

  useEffect(() => {
    if (!isOfflineMode && user) {
      syncCreditsWithServer();
    }
  }, [isOfflineMode, user]);

  useEffect(() => {
    if (networkOffline && !isOfflineMode) {
      setIsOfflineMode(true);
    }
  }, [networkOffline]);

  useEffect(() => {
    if (credits) {
      console.log("Current credits state:", {
        quiz_credits: credits.quiz_credits,
        interview_credits: credits.interview_credits,
        assessment_credits: credits.assessment_credits,
        tutor_message_credits: credits.tutor_message_credits
      });
    }
  }, [credits]);

  return {
    credits,
    loading,
    error,
    isOfflineMode: isOfflineMode || networkOffline || hasConnectionError,
    decrementCredits,
    checkCredits,
    fetchUserCredits,
    syncCreditsWithServer,
    pendingTransactions: pendingTransactions.length,
    retryFetch: fetchUserCredits
  };
};
