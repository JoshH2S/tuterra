
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { InterviewFeedback } from '@/types/interview';
import { InterviewTranscript } from '@/types/interview';

export const useInterviewFeedback = (sessionId: string | null) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch existing feedback for a session
   */
  const fetchFeedback = async () => {
    if (!sessionId) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('interview_feedback')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        const formattedFeedback: InterviewFeedback = {
          id: data.id,
          sessionId: data.session_id,
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          tips: data.tips || [],
          overallFeedback: data.overall_feedback,
          createdAt: data.created_at
        };
        
        setFeedback(formattedFeedback);
        return formattedFeedback;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to fetch feedback');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate feedback from interview transcript
   */
  const generateFeedback = async (transcript: InterviewTranscript) => {
    if (!sessionId) {
      toast({
        title: 'Error',
        description: 'Session ID is required to generate feedback',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if feedback already exists
      const existingFeedback = await fetchFeedback();
      if (existingFeedback) {
        setFeedback(existingFeedback);
        return existingFeedback;
      }
      
      // Generate new feedback
      const response = await supabase.functions.invoke('generate-feedback', {
        body: { sessionId }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      const feedbackData = response.data.feedback;
      
      const formattedFeedback: InterviewFeedback = {
        id: feedbackData.id,
        sessionId: feedbackData.session_id,
        strengths: feedbackData.strengths || [],
        weaknesses: feedbackData.weaknesses || [],
        tips: feedbackData.tips || [],
        overallFeedback: feedbackData.overall_feedback,
        createdAt: feedbackData.created_at
      };
      
      setFeedback(formattedFeedback);
      return formattedFeedback;
      
    } catch (err) {
      console.error('Error generating feedback:', err);
      setError('Failed to generate feedback');
      
      toast({
        title: 'Error',
        description: 'Failed to generate feedback. Please try again.',
        variant: 'destructive'
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    feedback,
    error,
    fetchFeedback,
    generateFeedback
  };
};
