
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InterviewSession, InterviewQuestion, InterviewResponse, InterviewTranscript } from '@/types/interview';

export const useInterviewPersistence = () => {
  /**
   * Save a response to a question
   */
  const saveResponse = useCallback(async (questionId: string, response: string) => {
    try {
      const { data, error } = await supabase
        .from('interview_responses')
        .insert({
          question_id: questionId,
          response
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        questionId: data.question_id,
        response: data.response,
        createdAt: data.created_at
      } as InterviewResponse;
      
    } catch (error) {
      console.error('Error saving response:', error);
      throw error;
    }
  }, []);

  /**
   * Mark an interview session as completed
   */
  const completeSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('interview_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  }, []);

  /**
   * Get all responses for a session
   */
  const getSessionResponses = useCallback(async (sessionId: string) => {
    try {
      // First get the session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      
      // Then get all questions for this session
      const { data: questionsData, error: questionsError } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      const questionIds = questionsData.map(q => q.id);
      
      // Get all responses for these questions
      const { data: responsesData, error: responsesError } = await supabase
        .from('interview_responses')
        .select('*')
        .in('question_id', questionIds);
      
      if (responsesError) throw responsesError;
      
      // Format as a transcript
      const transcript: InterviewTranscript = {
        sessionId,
        jobTitle: sessionData.job_title,
        industry: sessionData.industry,
        questions: questionsData.map(q => {
          const response = responsesData.find(r => r.question_id === q.id);
          return {
            id: q.id,
            question: q.question,
            response: response ? response.response : "No answer provided"
          };
        })
      };
      
      return transcript;
      
    } catch (error) {
      console.error('Error getting session responses:', error);
      throw error;
    }
  }, []);

  return {
    saveResponse,
    completeSession,
    getSessionResponses
  };
};
