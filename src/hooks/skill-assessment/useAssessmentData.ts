
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserCredits } from '@/hooks/useUserCredits';

export const useAssessmentData = () => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkCredits, decrementCredits, isOfflineMode, fetchUserCredits } = useUserCredits();
  
  // Get assessment from localStorage if available
  const getLocalAssessment = useCallback(() => {
    try {
      const assessments = JSON.parse(localStorage.getItem('offline_assessments') || '[]');
      return assessments.find(a => a.id === id);
    } catch (e) {
      console.error('Error getting local assessment:', e);
      return null;
    }
  }, [id]);
  
  // Store assessment in localStorage
  const storeLocalAssessment = useCallback((assessmentData) => {
    try {
      const assessments = JSON.parse(localStorage.getItem('offline_assessments') || '[]');
      // Check if assessment already exists in local storage
      const existingIndex = assessments.findIndex(a => a.id === assessmentData.id);
      
      if (existingIndex >= 0) {
        // Update existing assessment
        assessments[existingIndex] = assessmentData;
      } else {
        // Add new assessment
        assessments.push(assessmentData);
      }
      
      localStorage.setItem('offline_assessments', JSON.stringify(assessments));
    } catch (e) {
      console.error('Error storing assessment locally:', e);
    }
  }, []);

  // Fetch assessment with retry logic
  const fetchAssessment = useCallback(async (retry = false) => {
    if (!id) return;
    
    // Check localStorage first
    const localAssessment = getLocalAssessment();
    
    // If we're in offline mode and have a local copy, use it
    if (isOfflineMode && localAssessment) {
      console.log('Using locally stored assessment in offline mode');
      setAssessment(localAssessment);
      setLoading(false);
      return;
    }
    
    // Only increase retry count for explicit retries
    if (retry) {
      setRetryCount(prev => prev + 1);
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Add extra delay on retries to prevent rate limiting
      if (retry && retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.min(retryCount, 5)));
      }
      
      const { data, error } = await supabase
        .from('skill_assessments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching assessment:', error);
        
        // Check if this is a permission or network error
        if (error.code === '42501' || error.message.includes('permission denied')) {
          // Switch to offline mode if we have local data
          if (localAssessment) {
            console.log('Permission error, using local assessment data');
            setAssessment(localAssessment);
            setLoading(false);
            // Don't set error so UI doesn't show error state
            return;
          }
        }
        
        throw error;
      }
      
      if (!data) {
        setError("Assessment not found");
        
        // Check if we have a local copy as fallback
        const localFallback = getLocalAssessment();
        if (localFallback) {
          console.log('Server data not found, using local copy as fallback');
          setAssessment(localFallback);
          
          toast({
            title: 'Using Cached Version',
            description: 'The server copy was not available. Using your locally cached version.',
            variant: 'default',
          });
          return;
        }
        
        toast({
          title: 'Assessment Not Found',
          description: 'The requested assessment could not be found',
          variant: 'destructive',
        });
        return;
      }
      
      // Store for offline use
      storeLocalAssessment(data);
      setAssessment(data);
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError(err.message);
      
      // Try local fallback
      const localFallback = getLocalAssessment();
      if (localFallback) {
        console.log('Error fetching from server, using local fallback');
        setAssessment(localFallback);
        toast({
          title: 'Network Error',
          description: 'Using locally cached data instead. Some features might be limited.',
          variant: 'default',
        });
        return;
      }
      
      toast({
        title: 'Error',
        description: 'Failed to load the assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, retryCount, isOfflineMode, getLocalAssessment, storeLocalAssessment]);

  // Manual retry function for users - ensure it returns a Promise
  const retryFetchAssessment = useCallback(async (): Promise<void> => {
    await fetchAssessment(true);
    return Promise.resolve();
  }, [fetchAssessment]);

  const startAssessment = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to take this assessment',
        variant: 'destructive',
      });
      return;
    }
    
    // Always fetch latest credits first
    await fetchUserCredits();
    
    // Check if user has assessment credits or is in offline mode
    const hasCredits = checkCredits('assessment_credits');
    
    // If we don't have credits and we're not in offline mode, show upgrade prompt
    if (!hasCredits && !isOfflineMode) {
      setShowUpgradePrompt(true);
      toast({
        title: 'No credits remaining',
        description: 'You have used all your free skill assessment credits. Please upgrade to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Decrement assessment credits - skip decrementing if in offline mode
      if (!isOfflineMode) {
        const decrementSuccess = await decrementCredits('assessment_credits');
        
        if (!decrementSuccess) {
          console.log('Failed to decrement credits, continuing in offline mode');
          // We don't need to set isOfflineMode manually, as the useUserCredits hook handles this
          return;
        }
      }
      
      // Show different toast messages based on online/offline status
      if (isOfflineMode) {
        toast({
          title: 'Offline Mode',
          description: 'Taking assessment in offline mode. Changes will sync when you reconnect.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Assessment Started',
          description: 'Good luck with your assessment!',
          variant: 'default',
        });
      }
      
      // Store assessment start in local storage for offline mode
      try {
        const assessmentStarts = JSON.parse(localStorage.getItem('offline_assessment_starts') || '[]');
        assessmentStarts.push({
          assessmentId: id,
          userId: user.id,
          startTime: new Date().toISOString()
        });
        localStorage.setItem('offline_assessment_starts', JSON.stringify(assessmentStarts));
      } catch (e) {
        console.error('Error storing assessment start locally:', e);
      }
      
      navigate(`/take-assessment/${id}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to start the assessment. Please try again or check your connectivity.',
        variant: 'destructive',
      });
    }
  };
  
  useEffect(() => {
    fetchAssessment();
    
    // Setup automatic background refresh when network status changes
    const handleOnline = () => {
      // If we're coming back online, refresh data
      fetchAssessment();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [id, fetchAssessment]);
  
  return {
    assessment,
    loading,
    error,
    startAssessment,
    showUpgradePrompt,
    setShowUpgradePrompt,
    isOfflineMode,
    retryFetchAssessment  // Make sure this is in the returned object
  };
};
