
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  InterviewState, 
  InterviewSession, 
  InterviewQuestion,
  InterviewResponse,
  InterviewFeedback
} from '@/types/interview';

// Initial state
const initialState: InterviewState = {
  session: null,
  questions: [],
  currentQuestionIndex: 0,
  responses: {},
  feedback: null,
  status: 'idle',
  error: null
};

// Define action types
type Action = 
  | { type: 'SET_SESSION', payload: InterviewSession }
  | { type: 'SET_QUESTIONS', payload: InterviewQuestion[] }
  | { type: 'SET_CURRENT_QUESTION', payload: number }
  | { type: 'SET_RESPONSE', payload: { questionId: string, response: string } }
  | { type: 'SET_FEEDBACK', payload: InterviewFeedback }
  | { type: 'SET_STATUS', payload: InterviewState['status'] }
  | { type: 'SET_ERROR', payload: string | null }
  | { type: 'RESET' };

// Reducer function
const reducer = (state: InterviewState, action: Action): InterviewState => {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestionIndex: action.payload };
    case 'SET_RESPONSE':
      return { 
        ...state, 
        responses: { 
          ...state.responses, 
          [action.payload.questionId]: action.payload.response 
        } 
      };
    case 'SET_FEEDBACK':
      return { ...state, feedback: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// Create context
interface InterviewContextType {
  state: InterviewState;
  createSession: (jobTitle: string, industry: string, jobDescription?: string) => Promise<void>;
  startInterview: () => Promise<void>;
  saveResponse: (questionId: string, response: string) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeInterview: () => Promise<void>;
  resetInterview: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

// Provider component
export const InterviewProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Create a new interview session
  const createSession = async (jobTitle: string, industry: string, jobDescription?: string) => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      
      // Create a new session in the database
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          job_title: jobTitle,
          industry: industry,
          job_description: jobDescription,
          status: 'created' as const
        })
        .select()
        .single();
      
      if (error) throw error;
      
      dispatch({ type: 'SET_SESSION', payload: {
        id: data.id,
        jobTitle: data.job_title,
        industry: data.industry,
        jobDescription: data.job_description,
        status: data.status,
        createdAt: data.created_at
      }});
      
      // Generate interview questions
      const response = await supabase.functions.invoke('generate-interview', {
        body: {
          sessionId: data.id,
          jobTitle,
          industry,
          jobDescription
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      const questions = response.data.questions.map(q => ({
        id: q.id,
        sessionId: q.session_id,
        question: q.question,
        questionOrder: q.question_order,
        createdAt: q.created_at
      }));
      
      dispatch({ type: 'SET_QUESTIONS', payload: questions });
      dispatch({ type: 'SET_STATUS', payload: 'ready' });
      
    } catch (error) {
      console.error('Error creating interview session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create interview session' });
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      
      toast({
        title: 'Error',
        description: 'Failed to create interview session. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Start the interview
  const startInterview = async () => {
    if (state.questions.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'No questions available' });
      return;
    }
    
    dispatch({ type: 'SET_CURRENT_QUESTION', payload: 0 });
    dispatch({ type: 'SET_STATUS', payload: 'in-progress' });
  };

  // Save a response to a question
  const saveResponse = async (questionId: string, response: string) => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      
      // Save to local state first
      dispatch({ 
        type: 'SET_RESPONSE', 
        payload: { questionId, response } 
      });
      
      // Save to database
      const { error } = await supabase
        .from('interview_responses')
        .insert({
          question_id: questionId,
          response: response
        });
      
      if (error) throw error;
      
      dispatch({ type: 'SET_STATUS', payload: 'in-progress' });
      
    } catch (error) {
      console.error('Error saving response:', error);
      
      toast({
        title: 'Warning',
        description: 'Your response was saved locally but not to the database.',
        variant: 'destructive'
      });
      
      dispatch({ type: 'SET_STATUS', payload: 'in-progress' });
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      dispatch({ 
        type: 'SET_CURRENT_QUESTION', 
        payload: state.currentQuestionIndex + 1 
      });
    }
  };

  // Move to previous question
  const previousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      dispatch({ 
        type: 'SET_CURRENT_QUESTION', 
        payload: state.currentQuestionIndex - 1 
      });
    }
  };

  // Complete the interview and generate feedback
  const completeInterview = async () => {
    if (!state.session) return;
    
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      
      // Generate feedback
      const response = await supabase.functions.invoke('generate-feedback', {
        body: { sessionId: state.session.id }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      const feedbackData = response.data.feedback;
      
      dispatch({ 
        type: 'SET_FEEDBACK', 
        payload: {
          id: feedbackData.id,
          sessionId: feedbackData.session_id,
          strengths: feedbackData.strengths,
          weaknesses: feedbackData.weaknesses,
          tips: feedbackData.tips,
          overallFeedback: feedbackData.overall_feedback,
          createdAt: feedbackData.created_at
        }
      });
      
      dispatch({ type: 'SET_STATUS', payload: 'completed' });
      
    } catch (error) {
      console.error('Error completing interview:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to generate feedback. Please try again.',
        variant: 'destructive'
      });
      
      dispatch({ type: 'SET_STATUS', payload: 'in-progress' });
    }
  };

  // Reset the interview state
  const resetInterview = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <InterviewContext.Provider value={{
      state,
      createSession,
      startInterview,
      saveResponse,
      nextQuestion,
      previousQuestion,
      completeInterview,
      resetInterview
    }}>
      {children}
    </InterviewContext.Provider>
  );
};

// Custom hook to use the interview context
export const useInterview = () => {
  const context = useContext(InterviewContext);
  
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  
  return context;
};
