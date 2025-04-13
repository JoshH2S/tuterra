
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

  // Store pending transactions for later sync
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

  const fetchUserCredits = useCallback(async () => {
    if (!user) {
      setLoading(false);
      console.log('No user found, cannot fetch credits');
      return;
    }

    // If we're offline or have connection errors, skip server fetch and use local data
    if (networkOffline || hasConnectionError) {
      console.log('Network offline or connection errors, using local credits');
      setIsOfflineMode(true);
      useLocalCredits(user.id);
      setLoading(false);
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
        // Log the full error for better debugging
        console.error('Supabase error fetching credits:', fetchError);
        
        // Check for specific error codes that indicate permission issues
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

      // If no data is found, create a new credits record
      if (!data) {
        console.log('No credits found for user, attempting to create default credits');
        
        try {
          // Try to create default credits for the user
          const { data: newCredits, error: insertError } = await (supabase as any)
            .from('user_credits')
            .insert({
              user_id: user.id,
              quiz_credits: 5,
              interview_credits: 1,
              assessment_credits: 2, // Updated to match CreditsBadge display
              tutor_message_credits: 5
            })
            .select('*')
            .single();
            
          if (insertError) {
            console.error('Error creating default credits:', insertError);
            
            // If creation fails due to permissions, switch to offline mode
            const errorIsPermissionDenied = 
              insertError.code === '42501' || 
              insertError.message.includes('permission denied') || 
              (insertError as any).code === 'PGRST301' || 
              insertError.message.includes('403');
            
            if (errorIsPermissionDenied) {
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
            
            // Update local cache with server data
            storeLocalCredits(newCredits);
          } else {
            // Fallback if insert doesn't return data
            useLocalCredits(user.id);
            setIsOfflineMode(true);
          }
        } catch (insertErr) {
          console.error('Failed to create default credits:', insertErr);
          useLocalCredits(user.id);
          setIsOfflineMode(true);
        }
      } else {
        console.log('Found existing credits:', data);
        setCredits(data as UserCredits);
        setIsOfflineMode(false);
        
        // Update local cache with server data
        storeLocalCredits(data);
      }
    } catch (err) {
      console.error('Error fetching user credits:', err);
      setError('Failed to load your available credits');
      
      // Provide fallback credits for UI display
      useLocalCredits(user?.id || 'unknown');
      setIsOfflineMode(true);
      
      // Only show toast if it's a real error, not just missing data
      if (err instanceof Error && err.message !== 'No data found') {
        toast({
          title: "Error",
          description: "Failed to load credits. Using offline mode.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, networkOffline, hasConnectionError]);

  // Store credits in local storage for offline use
  const storeLocalCredits = (creditsData: UserCredits) => {
    try {
      localStorage.setItem(`local_credits_${creditsData.user_id}`, JSON.stringify(creditsData));
      console.log('Stored credits in local storage:', creditsData);
    } catch (e) {
      console.error('Error storing credits locally:', e);
    }
  };

  // Use local credits when offline or when there's an error
  const useLocalCredits = (userId: string) => {
    const defaultCredits = {
      id: 'local-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      quiz_credits: 5,
      interview_credits: 1,
      assessment_credits: 2, // Updated to match CreditsBadge display
      tutor_message_credits: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Using local credits:', defaultCredits);
    
    // Try to get stored local credits first
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
    
    setCredits(defaultCredits);
    // Store local credits for later use
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

      // If in offline mode, just update the local state
      if (isOfflineMode || networkOffline || hasConnectionError) {
        console.log(`Network issue detected: updating ${creditType} locally only`);
        
        const updatedCredits = {
          ...credits,
          [creditType]: credits[creditType] - 1,
          updated_at: new Date().toISOString(),
        };
        
        setCredits(updatedCredits);
        storeLocalCredits(updatedCredits);
        
        // Add to pending transactions for later sync
        addPendingTransaction('decrementCredits', { creditType, userId: user.id });
        
        toast({
          title: "Offline Mode",
          description: "Using offline mode for credits. Changes will sync when you reconnect.",
          variant: "default",
        });
        
        return true;
      }

      console.log(`Decrementing ${creditType} for user ${user.id}`);

      // Try to update in Supabase
      const { error } = await (supabase as any)
        .from('user_credits')
        .update({ [creditType]: credits[creditType] - 1 })
        .eq('user_id', user.id);

      if (error) {
        // Check for permission denied or other errors
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
          
          // Add to pending transactions
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

      // Update local state
      const updatedCredits = {
        ...credits,
        [creditType]: credits[creditType] - 1,
        updated_at: new Date().toISOString(),
      };
      
      setCredits(updatedCredits);
      // Update local storage cache
      storeLocalCredits(updatedCredits);

      console.log(`Successfully decremented ${creditType}, remaining: ${credits[creditType] - 1}`);
      return true;
    } catch (err) {
      console.error(`Error decrementing ${creditType}:`, err);
      
      // Fall back to offline mode
      setIsOfflineMode(true);
      
      const updatedCredits = {
        ...credits,
        [creditType]: credits[creditType] - 1,
        updated_at: new Date().toISOString(),
      };
      
      setCredits(updatedCredits);
      storeLocalCredits(updatedCredits);
      
      // Add to pending transactions
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
    return credits[creditType] > 0;
  };

  // Sync with server when coming back online
  const syncCreditsWithServer = async () => {
    if (!user || !credits || !pendingTransactions.length) return;
    
    // Skip if we're still offline
    if (networkOffline || hasConnectionError) return;
    
    console.log('Attempting to sync pending transactions with server');
    
    try {
      // Check if we have server-side credits first
      const { data, error } = await (supabase as any)
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking server credits during sync:', error);
        return;
      }
      
      // Process each pending transaction
      const transactionsToProcess = [...pendingTransactions];
      let successfulSyncs = 0;
      
      for (const transaction of transactionsToProcess) {
        if (transaction.type === 'decrementCredits') {
          const { creditType } = transaction.data;
          
          // If we have server data, update it
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
                
                // Remove this transaction from pending
                setPendingTransactions(prev => 
                  prev.filter(t => t.id !== transaction.id)
                );
              }
            } catch (e) {
              console.error('Error syncing transaction:', e);
            }
          } else {
            // No server record, create one with our local data
            try {
              const { error: insertError } = await (supabase as any)
                .from('user_credits')
                .insert({
                  user_id: user.id,
                  ...credits
                });
                
              if (!insertError) {
                successfulSyncs++;
                
                // Remove all transactions since we've synced everything
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
        
        // Update local storage
        try {
          localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));
        } catch (e) {
          console.error('Error updating pending transactions in storage:', e);
        }
        
        // Refresh credits from server
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

  // Initialize credits on first load
  useEffect(() => {
    if (user) {
      fetchUserCredits();
      
      // Load any pending transactions from storage
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
    
    // Setup online/offline detection
    const handleOnline = () => {
      console.log('Browser went online, attempting to sync credits');
      // Give some time for connection to stabilize
      setTimeout(() => {
        syncCreditsWithServer();
      }, 2000);
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user, fetchUserCredits]);

  // Try to sync anytime offline mode changes
  useEffect(() => {
    if (!isOfflineMode && user) {
      syncCreditsWithServer();
    }
  }, [isOfflineMode, user]);

  // Current connection status changed, update our state
  useEffect(() => {
    if (networkOffline && !isOfflineMode) {
      setIsOfflineMode(true);
    }
  }, [networkOffline]);

  // Log current credit state on every update
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
    pendingTransactions: pendingTransactions.length
  };
};
