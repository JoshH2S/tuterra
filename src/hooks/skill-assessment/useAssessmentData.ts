
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
  const { checkCredits, decrementCredits, permissionError } = useUserCredits();
  
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('skill_assessments')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
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
    
    // Check if user has assessment credits
    if (!checkCredits('assessment_credits') && !permissionError) {
      setShowUpgradePrompt(true);
      toast({
        title: 'No credits remaining',
        description: 'You have used all your free skill assessment credits. Please upgrade to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Decrement assessment credits
      const success = await decrementCredits('assessment_credits');
      
      // If offline mode or decrementCredits was successful, proceed
      if (success || permissionError) {
        // If in offline mode (permissionError is true), but decrementCredits failed,
        // we'll still let the user take the assessment
        if (permissionError && !success) {
          toast({
            title: 'Offline Mode',
            description: 'You can proceed with the assessment in offline mode.',
            variant: 'default',
          });
        }
        
        navigate(`/take-assessment/${id}`);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to start the assessment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      
      // Even in case of error, let the user proceed if we're in offline mode
      if (permissionError) {
        toast({
          title: 'Offline Mode',
          description: 'You can proceed with the assessment in offline mode.',
          variant: 'default',
        });
        navigate(`/take-assessment/${id}`);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to start the assessment',
          variant: 'destructive',
        });
      }
    }
  };
  
  return {
    assessment,
    loading,
    error,
    startAssessment,
    showUpgradePrompt,
    setShowUpgradePrompt,
    offlineMode: permissionError
  };
};
