
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  status: 'not_started' | 'submitted' | 'feedback_given';
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

// Context Type
type InternshipContextType = {
  session: InternshipSession | null;
  tasks: Task[];
  deliverables: Record<string, Deliverable>;
  feedbacks: Record<string, Feedback>;
  loading: boolean;
  error: string | null;
  fetchSession: (sessionId: string) => Promise<InternshipSession | null>; // Updated return type here
  fetchTasks: (sessionId: string) => Promise<void>;
  fetchDeliverables: (taskIds: string[]) => Promise<void>;
  createInternshipSession: (jobTitle: string, industry: string, jobDescription: string) => Promise<string | null>;
  submitTask: (task: Task, content: string, attachmentUrl: string | null, attachmentName: string | null) => Promise<boolean>;
  completePhase: (sessionId: string, phaseNumber: number) => Promise<boolean>;
};

// Default values
const defaultContextValue: InternshipContextType = {
  session: null,
  tasks: [],
  deliverables: {},
  feedbacks: {},
  loading: false,
  error: null,
  fetchSession: async () => null, // Updated return value here to match the type
  fetchTasks: async () => {},
  fetchDeliverables: async () => {},
  createInternshipSession: async () => null,
  submitTask: async () => false,
  completePhase: async () => false,
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
  const [error, setError] = useState<string | null>(null);

  // Fetch session data from Supabase
  const fetchSession = async (sessionId: string): Promise<InternshipSession | null> => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError(err.message);
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

  // Fetch tasks for a session
  const fetchTasks = async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('internship_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('task_order', { ascending: true });

      if (tasksError) throw tasksError;

      if (!tasksData || tasksData.length === 0) {
        // No tasks found - we'll try to generate them through the edge function
        await generateTasks(sessionId);
      } else {
        // Type-safe conversion for task status
        const typedTasks = tasksData.map(task => ({
          ...task,
          status: task.status as 'not_started' | 'submitted' | 'feedback_given'
        }));
        
        setTasks(typedTasks);
        
        // Fetch deliverables for these tasks
        if (typedTasks.length > 0) {
          await fetchDeliverables(typedTasks.map(t => t.id));
        }
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
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
  const generateTasks = async (sessionId: string) => {
    if (!session) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-internship-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        },
        body: JSON.stringify({
          job_title: session.job_title,
          industry: session.industry,
          session_id: sessionId
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate tasks');
      }

      // Ensure tasks have the correct status type
      const typedTasks = result.tasks.map((task: any) => ({
        ...task,
        status: task.status as 'not_started' | 'submitted' | 'feedback_given'
      }));
      
      setTasks(typedTasks);
    } catch (err: any) {
      console.error('Error generating tasks:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to generate internship tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch deliverables and feedback
  const fetchDeliverables = async (taskIds: string[]) => {
    if (!taskIds.length) return;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch deliverables
      const { data: deliverablesData, error: deliverablesError } = await supabase
        .from('internship_deliverables')
        .select('*')
        .in('task_id', taskIds);

      if (deliverablesError) throw deliverablesError;

      // Create a map of task_id to deliverable
      const deliverablesMap: Record<string, Deliverable> = {};
      const deliverableIds: string[] = [];

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
        setDeliverables(deliverablesMap);
      }

      // If we have deliverables, fetch feedback
      if (deliverableIds.length) {
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('internship_feedback')
          .select('*')
          .in('deliverable_id', deliverableIds);

        if (feedbackError) throw feedbackError;

        // Create a map of deliverable_id to feedback
        const feedbackMap: Record<string, Feedback> = {};
        if (feedbackData) {
          feedbackData.forEach(feedback => {
            feedbackMap[feedback.deliverable_id] = feedback;
          });
          setFeedbacks(feedbackMap);
        }
      }
    } catch (err: any) {
      console.error('Error fetching deliverables and feedback:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a new internship session using the edge function
  const createInternshipSession = async (
    jobTitle: string, 
    industry: string, 
    jobDescription: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      // Call edge function to create session (we'll implement this next)
      const response = await fetch('https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/create-internship-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        },
        body: JSON.stringify({
          job_title: jobTitle,
          industry: industry,
          job_description: jobDescription
        })
      });

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
      setError(err.message);
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

      // Use the edge function to handle the submission and feedback generation
      const response = await fetch('https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/submit-internship-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
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
      setError(err.message);
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

  // Complete the current phase and move to the next
  const completePhase = async (sessionId: string, phaseNumber: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

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

      // Update session phase
      const { error: updateError } = await supabase
        .from('internship_sessions')
        .update({ current_phase: phaseNumber + 1 })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Insert progress entry
      const { error: progressError } = await supabase
        .from('internship_progress')
        .insert({
          user_id: session?.user_id,
          session_id: sessionId,
          phase_number: phaseNumber
        });

      if (progressError) throw progressError;

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
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message || 'Failed to complete this phase',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    tasks,
    deliverables,
    feedbacks,
    loading,
    error,
    fetchSession,
    fetchTasks,
    fetchDeliverables,
    createInternshipSession,
    submitTask,
    completePhase,
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
