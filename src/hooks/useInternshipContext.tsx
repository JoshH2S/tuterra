
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FullPageLoader } from '@/components/ui/loading-states';

// Types
export type InternshipSession = {
  id: string;
  job_title: string;
  industry: string;
  user_id: string;
  created_at: string;
  current_phase: number;
  job_description?: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'feedback_given';
  task_type: string;
  task_order: number;
  instructions: string;
};

export type Deliverable = {
  id: string;
  task_id: string;
  content: string;
  submitted_at: string;
  attachment_url: string | null;
  attachment_name: string | null;
  user_id?: string;
};

export type Feedback = {
  id: string;
  deliverable_id: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
};

export type ErrorState = {
  message: string;
  code?: string;
  details?: string;
  retryFn?: () => Promise<void>;
};

// Context Type
type InternshipContextType = {
  session: InternshipSession | null;
  tasks: Task[];
  deliverables: Record<string, Deliverable>;
  feedbacks: Record<string, Feedback>;
  loading: boolean;
  loadingPhase: boolean;
  error: ErrorState | null;
  fetchSession: (sessionId: string) => Promise<InternshipSession | null>;
  fetchTasks: (sessionId: string) => Promise<void>;
  fetchDeliverables: (taskIds: string[]) => Promise<void>;
  createInternshipSession: (jobTitle: string, industry: string, jobDescription: string) => Promise<string | null>;
  submitTask: (task: Task, content: string, attachmentUrl: string | null, attachmentName: string | null) => Promise<boolean>;
  completePhase: (sessionId: string, phaseNumber: number) => Promise<boolean>;
  resumeTask: (taskId: string) => Promise<boolean>;
  clearError: () => void;
  validateSessionAccess: (sessionId: string) => Promise<boolean>;
};

// Default values
const defaultContextValue: InternshipContextType = {
  session: null,
  tasks: [],
  deliverables: {},
  feedbacks: {},
  loading: false,
  loadingPhase: false,
  error: null,
  fetchSession: async () => null,
  fetchTasks: async () => {},
  fetchDeliverables: async () => {},
  createInternshipSession: async () => null,
  submitTask: async () => false,
  completePhase: async () => false,
  resumeTask: async () => false,
  clearError: () => {},
  validateSessionAccess: async () => false,
};

// Create context
const InternshipContext = createContext<InternshipContextType>(defaultContextValue);

// Provider component
export const InternshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState<InternshipSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<Record<string, Deliverable>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState | null>(null);
  
  // Clear error helper
  const clearError = () => setError(null);

  // Security: Validate session belongs to current user
  const validateSessionAccess = async (sessionId: string): Promise<boolean> => {
    try {
      // Get user's auth status
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        throw new Error('You must be logged in to access internship sessions');
      }
      
      // Check if session belongs to current user
      const { data, error: sessionError } = await supabase
        .from('internship_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      
      if (data?.user_id !== authSession.user.id) {
        throw new Error('You do not have permission to access this internship session');
      }
      
      return true;
    } catch (err: any) {
      console.error('Access validation error:', err);
      setError({
        message: 'Access denied',
        details: err.message || 'You do not have permission to access this session',
        code: 'FORBIDDEN'
      });
      navigate('/internship-start');
      return false;
    }
  };

  // Fetch session data from Supabase with validation
  const fetchSession = async (sessionId: string): Promise<InternshipSession | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate access first
      const hasAccess = await validateSessionAccess(sessionId);
      if (!hasAccess) return null;
      
      const { data, error: sessionError } = await supabase
        .from('internship_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      if (!data) throw new Error('Session not found');

      setSession(data);
      return data;
    } catch (err: any) {
      console.error('Error fetching session:', err);
      setError({
        message: 'Failed to load session data',
        details: err.message,
        code: err.code || 'FETCH_ERROR',
        retryFn: () => fetchSession(sessionId)
      });
      toast({
        title: 'Error',
        description: 'Failed to load session data',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks for a session with improved error handling
  const fetchTasks = async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate access first
      const hasAccess = await validateSessionAccess(sessionId);
      if (!hasAccess) return;
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('internship_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('task_order', { ascending: true });

      if (tasksError) throw tasksError;

      if (!tasksData || tasksData.length === 0) {
        // No tasks found - we'll try to generate them through the edge function
        const generatedTasks = await generateTasks(sessionId);
        if (generatedTasks) {
          // We successfully generated tasks
          return;
        }
      } else {
        // Type-safe conversion for task status
        const typedTasks = tasksData.map(task => ({
          ...task,
          status: task.status as 'not_started' | 'in_progress' | 'submitted' | 'feedback_given'
        }));
        
        setTasks(typedTasks);
        
        // Fetch deliverables for these tasks
        if (typedTasks.length > 0) {
          await fetchDeliverables(typedTasks.map(t => t.id));
        }
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError({
        message: 'Failed to load internship tasks',
        details: err.message,
        code: err.code || 'FETCH_ERROR',
        retryFn: () => fetchTasks(sessionId)
      });
      toast({
        title: 'Error',
        description: 'Failed to load internship tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate tasks using the edge function
  const generateTasks = async (sessionId: string): Promise<boolean> => {
    if (!session) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      // Rate limiting check (simple timestamp-based approach)
      const lastRequestTime = localStorage.getItem('lastTaskGeneration');
      const now = Date.now();
      if (lastRequestTime && (now - parseInt(lastRequestTime)) < 5000) { // 5 second cooldown
        throw new Error('Please wait before requesting again');
      }
      localStorage.setItem('lastTaskGeneration', now.toString());
      
      const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-internship-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          job_title: session.job_title,
          industry: session.industry,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate tasks');
      }

      // Ensure tasks have the correct status type
      const typedTasks = result.tasks.map((task: any) => ({
        ...task,
        status: task.status as 'not_started' | 'in_progress' | 'submitted' | 'feedback_given'
      }));
      
      setTasks(typedTasks);
      return true;
    } catch (err: any) {
      console.error('Error generating tasks:', err);
      setError({
        message: 'Failed to generate internship tasks',
        details: err.message,
        code: 'GENERATION_ERROR',
        retryFn: () => { void generateTasks(sessionId); }
      });
      toast({
        title: 'Error',
        description: 'Failed to generate internship tasks',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch deliverables and feedback with batch processing
  const fetchDeliverables = async (taskIds: string[]) => {
    if (!taskIds.length) return;

    try {
      setLoading(true);
      setError(null);
      
      // Process in batches of 20 for large datasets
      const BATCH_SIZE = 20;
      const deliverablesMap: Record<string, Deliverable> = {};
      const deliverableIds: string[] = [];
      
      // Process tasks in batches
      for (let i = 0; i < taskIds.length; i += BATCH_SIZE) {
        const batchTaskIds = taskIds.slice(i, i + BATCH_SIZE);
        
        // Fetch deliverables for current batch
        const { data: deliverablesData, error: deliverablesError } = await supabase
          .from('internship_deliverables')
          .select('*')
          .in('task_id', batchTaskIds);

        if (deliverablesError) throw deliverablesError;

        if (deliverablesData) {
          deliverablesData.forEach(deliverable => {
            // Ensure it matches the Deliverable type with attachment fields
            const typedDeliverable: Deliverable = {
              ...deliverable,
              attachment_url: deliverable.attachment_url || null,
              attachment_name: deliverable.attachment_name || null
            };
            deliverablesMap[deliverable.task_id] = typedDeliverable;
            deliverableIds.push(deliverable.id);
          });
        }
      }
      
      setDeliverables(deliverablesMap);

      // If we have deliverables, fetch feedback in batches
      if (deliverableIds.length) {
        const feedbackMap: Record<string, Feedback> = {};
        
        for (let i = 0; i < deliverableIds.length; i += BATCH_SIZE) {
          const batchDeliverableIds = deliverableIds.slice(i, i + BATCH_SIZE);
          
          const { data: feedbackData, error: feedbackError } = await supabase
            .from('internship_feedback')
            .select('*')
            .in('deliverable_id', batchDeliverableIds);

          if (feedbackError) throw feedbackError;

          if (feedbackData) {
            feedbackData.forEach(feedback => {
              feedbackMap[feedback.deliverable_id] = feedback;
            });
          }
        }
        
        setFeedbacks(feedbackMap);
      }
    } catch (err: any) {
      console.error('Error fetching deliverables and feedback:', err);
      setError({
        message: 'Failed to load task data',
        details: err.message,
        code: err.code || 'FETCH_ERROR',
        retryFn: () => fetchDeliverables(taskIds)
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new internship session using the edge function with improved validation
  const createInternshipSession = async (
    jobTitle: string, 
    industry: string, 
    jobDescription: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Client-side validation
      if (!jobTitle.trim()) throw new Error('Job title is required');
      if (!industry.trim()) throw new Error('Industry is required');
      
      // Rate limiting check
      const lastRequestTime = localStorage.getItem('lastSessionCreation');
      const now = Date.now();
      if (lastRequestTime && (now - parseInt(lastRequestTime)) < 10000) { // 10 second cooldown
        throw new Error('Please wait before creating another session');
      }
      localStorage.setItem('lastSessionCreation', now.toString());

      // Call edge function to create session (with authorization)
      const response = await fetch('https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/create-internship-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          job_title: jobTitle,
          industry: industry,
          job_description: jobDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create internship session');
      }
      
      toast({
        title: 'Success',
        description: 'Your virtual internship session has been created!',
      });
      
      return result.sessionId;
    } catch (err: any) {
      console.error('Error creating internship session:', err);
      setError({
        message: 'Failed to create internship session',
        details: err.message,
        code: err.code || 'CREATION_ERROR',
        retryFn: () => createInternshipSession(jobTitle, industry, jobDescription)
      });
      toast({
        title: 'Error',
        description: err.message || 'Failed to create internship session',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Resume a task that was started but not completed
  const resumeTask = async (taskId: string): Promise<boolean> => {
    if (!tasks.length) return false;
    
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      
      // If task already has a deliverable, it can be resumed
      if (deliverables[taskId]) {
        return true;
      }
      
      // Update the task status to in-progress
      const { error: updateError } = await supabase
        .from('internship_tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { ...t, status: 'in_progress' as const } : t
        )
      );
      
      return true;
    } catch (err: any) {
      console.error('Error resuming task:', err);
      toast({
        title: 'Error',
        description: 'Failed to resume task',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Submit a task with transaction safety
  const submitTask = async (
    task: Task, 
    content: string,
    attachmentUrl: string | null,
    attachmentName: string | null
  ): Promise<boolean> => {
    if (!session) return false;

    try {
      setLoading(true);
      setError(null);
      
      // Validate access
      await validateSessionAccess(session.id);
      
      // Rate limiting check
      const lastRequestTime = localStorage.getItem('lastTaskSubmission');
      const now = Date.now();
      if (lastRequestTime && (now - parseInt(lastRequestTime)) < 5000) { // 5 second cooldown
        throw new Error('Please wait before submitting again');
      }
      localStorage.setItem('lastTaskSubmission', now.toString());

      // Use the edge function to handle the submission and feedback generation
      const response = await fetch('https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/submit-internship-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          task_id: task.id,
          session_id: session.id,
          content: content,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          job_title: session.job_title,
          industry: session.industry
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit task');
      }

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, status: 'feedback_given' as const } : t
        )
      );
      
      setDeliverables(prev => ({
        ...prev,
        [task.id]: result.deliverable
      }));

      setFeedbacks({
        ...feedbacks,
        [result.deliverable.id]: result.feedback
      });
      
      toast({
        title: 'Task Submitted',
        description: 'Your work has been submitted and feedback is available.',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error submitting task:', err);
      setError({
        message: 'Failed to submit task',
        details: err.message,
        code: err.code || 'SUBMISSION_ERROR',
        retryFn: () => submitTask(task, content, attachmentUrl, attachmentName)
      });
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit task',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Complete the current phase and move to the next - with enforced progression
  const completePhase = async (sessionId: string, phaseNumber: number): Promise<boolean> => {
    try {
      setLoadingPhase(true);
      setError(null);
      
      // Validate access
      await validateSessionAccess(sessionId);

      // Check if all tasks have feedback in this phase
      const allTasksComplete = tasks.every(task => task.status === 'feedback_given');
      
      if (!allTasksComplete) {
        toast({
          title: 'Incomplete Tasks',
          description: 'Please complete all tasks before finishing this phase.',
          variant: 'warning',
        });
        return false;
      }

      // Run this in a transaction using the edge function for safety
      const response = await fetch('https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/enforce-phase-progression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          current_phase: phaseNumber,
          next_phase: phaseNumber + 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete this phase');
      }

      // Update local state
      if (session) {
        setSession({
          ...session,
          current_phase: phaseNumber + 1
        });
      }
      
      toast({
        title: 'Phase Completed',
        description: `You have successfully completed phase ${phaseNumber} of your internship!`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error completing phase:', err);
      setError({
        message: 'Failed to complete this phase',
        details: err.message,
        code: err.code || 'PHASE_ERROR',
        retryFn: () => completePhase(sessionId, phaseNumber)
      });
      toast({
        title: 'Error',
        description: err.message || 'Failed to complete this phase',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoadingPhase(false);
    }
  };

  const value = {
    session,
    tasks,
    deliverables,
    feedbacks,
    loading,
    loadingPhase,
    error,
    fetchSession,
    fetchTasks,
    fetchDeliverables,
    createInternshipSession,
    submitTask,
    completePhase,
    resumeTask,
    clearError,
    validateSessionAccess
  };

  return (
    <InternshipContext.Provider value={value}>
      {children}
    </InternshipContext.Provider>
  );
};

// Custom hook for using the context
export const useInternship = () => {
  const context = useContext(InternshipContext);
  if (context === undefined) {
    throw new Error('useInternship must be used within an InternshipProvider');
  }
  return context;
};
