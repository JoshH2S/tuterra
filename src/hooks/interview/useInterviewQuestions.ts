
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InterviewQuestion } from '@/types/interview';

// Default fallback questions in case the API fails
const DEFAULT_QUESTIONS = [
  "Tell me about yourself and your background.",
  "What are your greatest professional strengths?",
  "What do you consider to be your weaknesses?",
  "Why are you interested in this position?",
  "Where do you see yourself in 5 years?",
  "Describe a challenging situation at work and how you handled it.",
  "Why should we hire you?",
  "What are your salary expectations?",
  "Do you have any questions for us?"
];

export const useInterviewQuestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  /**
   * Generate interview questions via the Edge Function
   */
  const generateQuestions = useCallback(async (
    sessionId: string,
    jobTitle: string,
    industry: string,
    jobDescription?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      setUsedFallback(false);
      
      // Call the edge function to generate questions
      const response = await supabase.functions.invoke('generate-interview', {
        body: {
          sessionId,
          jobTitle,
          industry,
          jobDescription: jobDescription || ''
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.questions || response.data.questions.length === 0) {
        throw new Error('No questions returned from API');
      }
      
      // Format the questions to match our type
      const formattedQuestions: InterviewQuestion[] = response.data.questions.map((q: any) => ({
        id: q.id,
        sessionId: q.session_id,
        question: q.question,
        questionOrder: q.question_order,
        createdAt: q.created_at
      }));
      
      return formattedQuestions;
      
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate questions');
      
      // Use fallback questions if API fails
      const fallbackQuestions = await createFallbackQuestions(
        sessionId,
        jobTitle,
        industry
      );
      
      setUsedFallback(true);
      return fallbackQuestions;
      
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create fallback questions if the API fails
   */
  const createFallbackQuestions = useCallback(async (
    sessionId: string,
    jobTitle: string,
    industry: string
  ) => {
    try {
      // Insert default questions into the database manually instead of using RPC
      const insertPromises = DEFAULT_QUESTIONS.map((question, index) => 
        supabase
          .from('interview_questions')
          .insert({
            session_id: sessionId,
            question: question,
            question_order: index
          })
      );
      
      await Promise.all(insertPromises);
      
      // Fetch the inserted questions
      const { data, error } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });
      
      if (error) throw error;
      
      // Format the questions to match our type
      const formattedQuestions: InterviewQuestion[] = (data || []).map(q => ({
        id: q.id,
        sessionId: q.session_id,
        question: q.question,
        questionOrder: q.question_order,
        createdAt: q.created_at
      }));
      
      return formattedQuestions;
      
    } catch (err) {
      console.error('Error creating fallback questions:', err);
      // If even the fallback fails, return hardcoded questions
      // This ensures the user can always proceed with the interview
      return DEFAULT_QUESTIONS.map((question, index) => ({
        id: `fallback-${index}`,
        sessionId: sessionId,
        question: question,
        questionOrder: index,
        createdAt: new Date().toISOString()
      }));
    }
  }, []);

  /**
   * Fetch questions for an existing session
   */
  const fetchSessionQuestions = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('No questions found for this session');
      }
      
      // Format the questions to match our type
      const formattedQuestions: InterviewQuestion[] = data.map(q => ({
        id: q.id,
        sessionId: q.session_id,
        question: q.question,
        questionOrder: q.question_order,
        createdAt: q.created_at
      }));
      
      return formattedQuestions;
      
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    usedFallback,
    generateQuestions,
    fetchSessionQuestions
  };
};
