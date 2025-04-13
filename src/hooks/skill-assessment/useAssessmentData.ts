
import { useState, useEffect } from 'react';
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkCredits, decrementCredits, isOfflineMode, fetchUserCredits } = useUserCredits();
  
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('skill_assessments')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!data) {
          setError("Assessment not found");
          toast({
            title: 'Assessment Not Found',
            description: 'The requested assessment could not be found',
            variant: 'destructive',
          });
          return;
        }
        
        setAssessment(data);
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load the assessment',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [id]);

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
          setIsOfflineMode(true);
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
      if (isOfflineMode) {
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
      }
      
      navigate(`/take-assessment/${id}`);
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to start the assessment',
        variant: 'destructive',
      });
    }
  };
  
  return {
    assessment,
    loading,
    error,
    startAssessment,
    showUpgradePrompt,
    setShowUpgradePrompt,
    isOfflineMode
  };
};
