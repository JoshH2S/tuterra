
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  InternshipContextType, 
  InternshipSession, 
  Task, 
  Deliverable,
  Feedback,
  ErrorState
} from './types';
import * as internshipService from './internshipService';

// Default values for the context
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
export const InternshipContext = createContext<InternshipContextType>(defaultContextValue);

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
      await internshipService.validateSessionAccess(sessionId);
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
      
      const sessionData = await internshipService.fetchSessionById(sessionId);
      setSession(sessionData);
      return sessionData;
    } catch (err: any) {
      console.error('Error fetching session:', err);
      setError({
        message: 'Failed to load session data',
        details: err.message,
        code: err.code || 'FETCH_ERROR',
        retryFn: async () => { await fetchSession(sessionId); }
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
      
      const tasksData = await internshipService.fetchTasksBySessionId(sessionId);
      
      if (!tasksData || tasksData.length === 0) {
        // No tasks found - we'll try to generate them through the edge function
        if (session) {
          const generatedTasks = await internshipService.generateTasksForSession(
            sessionId, 
            session.job_title, 
            session.industry
          );
          if (generatedTasks) {
            setTasks(generatedTasks);
            // Fetch deliverables for these tasks
            if (generatedTasks.length > 0) {
              await fetchDeliverables(generatedTasks.map(t => t.id));
            }
          }
        }
      } else {
        setTasks(tasksData);
        
        // Fetch deliverables for these tasks
        if (tasksData.length > 0) {
          await fetchDeliverables(tasksData.map(t => t.id));
        }
      }
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError({
        message: 'Failed to load internship tasks',
        details: err.message,
        code: err.code || 'FETCH_ERROR',
        retryFn: async () => { await fetchTasks(sessionId); }
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

  // Fetch deliverables and feedback with batch processing
  const fetchDeliverables = async (taskIds: string[]) => {
    if (!taskIds.length) return;

    try {
      setLoading(true);
      setError(null);
      
      const { deliverables: deliverablesData, feedbacks: feedbacksData } = 
        await internshipService.fetchDeliverablesForTasks(taskIds);
      
      setDeliverables(deliverablesData);
      setFeedbacks(feedbacksData);
    } catch (err: any) {
      console.error('Error fetching deliverables and feedback:', err);
      setError({
        message: 'Failed to load task data',
        details: err.message,
        code: err.code || 'FETCH_ERROR',
        retryFn: async () => { await fetchDeliverables(taskIds); }
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
      
      const sessionId = await internshipService.createSession(jobTitle, industry, jobDescription);
      return sessionId;
    } catch (err: any) {
      console.error('Error creating internship session:', err);
      setError({
        message: 'Failed to create internship session',
        details: err.message,
        code: err.code || 'CREATION_ERROR',
        retryFn: async () => { return await createInternshipSession(jobTitle, industry, jobDescription); }
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
      
      await internshipService.resumeTaskById(taskId);
      
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
      
      const { deliverable, feedback } = await internshipService.submitTaskContent(
        task.id,
        session.id,
        content,
        attachmentUrl,
        attachmentName,
        session.job_title,
        session.industry
      );

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, status: 'feedback_given' as const } : t
        )
      );
      
      setDeliverables(prev => ({
        ...prev,
        [task.id]: deliverable
      }));

      setFeedbacks({
        ...feedbacks,
        [deliverable.id]: feedback
      });
      
      return true;
    } catch (err: any) {
      console.error('Error submitting task:', err);
      setError({
        message: 'Failed to submit task',
        details: err.message,
        code: err.code || 'SUBMISSION_ERROR',
        retryFn: async () => { return await submitTask(task, content, attachmentUrl, attachmentName); }
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

      const success = await internshipService.completeInternshipPhase(sessionId, phaseNumber);
      
      // Update local state
      if (success && session) {
        setSession({
          ...session,
          current_phase: phaseNumber + 1
        });
      }
      
      return success;
    } catch (err: any) {
      console.error('Error completing phase:', err);
      setError({
        message: 'Failed to complete this phase',
        details: err.message,
        code: err.code || 'PHASE_ERROR',
        retryFn: async () => { return await completePhase(sessionId, phaseNumber); }
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
