import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { InternshipSession, Task, Deliverable, Feedback } from './types';

/**
 * Validates that a session belongs to the current user
 */
export async function validateSessionAccess(sessionId: string): Promise<boolean> {
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
    throw err;
  }
}

/**
 * Fetches a single internship session by ID
 */
export async function fetchSessionById(sessionId: string): Promise<InternshipSession | null> {
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

  return data;
}

/**
 * Fetches tasks for a specific internship session
 */
export async function fetchTasksBySessionId(sessionId: string): Promise<Task[]> {
  // Validate access first
  const hasAccess = await validateSessionAccess(sessionId);
  if (!hasAccess) return [];
  
  const { data: tasksData, error: tasksError } = await supabase
    .from('internship_tasks')
    .select('*')
    .eq('session_id', sessionId)
    .order('task_order', { ascending: true });

  if (tasksError) throw tasksError;

  if (!tasksData || tasksData.length === 0) {
    return [];
  }

  // Type-safe conversion for task status
  const typedTasks = tasksData.map(task => ({
    ...task,
    status: task.status as 'not_started' | 'in_progress' | 'submitted' | 'feedback_given'
  }));
  
  return typedTasks;
}

/**
 * Fetches deliverables and associated feedback for a list of task IDs
 */
export async function fetchDeliverablesForTasks(taskIds: string[]): Promise<{
  deliverables: Record<string, Deliverable>,
  feedbacks: Record<string, Feedback>
}> {
  if (!taskIds.length) return { deliverables: {}, feedbacks: {} };

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

  // If we have deliverables, fetch feedback in batches
  const feedbackMap: Record<string, Feedback> = {};
  if (deliverableIds.length) {
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
  }

  return { deliverables: deliverablesMap, feedbacks: feedbackMap };
}

/**
 * Creates a new internship session using the edge function
 */
export async function createSession(
  jobTitle: string, 
  industry: string,
  jobDescription: string
): Promise<string | null> {
  console.log("🔄 internshipService: createSession called with:", {
    jobTitle,
    industry,
    jobDescriptionLength: jobDescription?.length || 0
  });
  
  // Client-side validation
  if (!jobTitle.trim()) {
    console.error("❌ internshipService: Empty job title");
    throw new Error('Job title is required');
  }
  if (!industry.trim()) {
    console.error("❌ internshipService: Empty industry");
    throw new Error('Industry is required');
  }
  
  // Rate limiting check
  const lastRequestTime = localStorage.getItem('lastSessionCreation');
  const now = Date.now();
  if (lastRequestTime && (now - parseInt(lastRequestTime)) < 10000) { // 10 second cooldown
    console.warn("⚠️ internshipService: Rate limiting - too many requests");
    throw new Error('Please wait before creating another session');
  }
  localStorage.setItem('lastSessionCreation', now.toString());

  console.log("🔐 internshipService: Getting auth session");
  const authSession = await supabase.auth.getSession();
  console.log("🔐 internshipService: Auth session retrieved", {
    hasSession: !!authSession.data.session,
    hasError: !!authSession.error,
    userId: authSession.data.session?.user.id
  });

  if (!authSession.data.session) {
    console.error("❌ internshipService: No auth session found");
    throw new Error('You must be logged in to create an internship session');
  }

  // Call edge function to create session (with authorization)
  console.log("📡 internshipService: Calling edge function to create session");
  try {
    // Try first with the edge function API
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://nhlsrtubyvggtkyrhkuu.supabase.co'}/functions/v1/create-internship-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authSession.data.session.access_token}`
      },
      body: JSON.stringify({
        job_title: jobTitle,
        industry: industry,
        job_description: jobDescription
      })
    });

    console.log("📡 internshipService: Edge function response received", {
      status: response.status,
      ok: response.ok
    });

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("❌ internshipService: Error response from edge function", errorData);
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        console.error("❌ internshipService: Failed to parse error response", parseError);
      }
      throw new Error(errorMessage);
    }

    // Parse successful response
    let result;
    try {
      result = await response.json();
      console.log("✅ internshipService: Edge function result", result);
    } catch (parseError) {
      console.error("❌ internshipService: Failed to parse success response", parseError);
      throw new Error('Invalid response from server');
    }
    
    if (!result.success) {
      console.error("❌ internshipService: Edge function returned success: false", result);
      throw new Error(result.error || 'Failed to create internship session');
    }
    
    // Check if this was an existing session
    if (result.message && result.message.includes("already have an internship")) {
      console.log("ℹ️ internshipService: Using existing internship session", result.sessionId);
      toast({
        title: 'Using Existing Internship',
        description: 'You already have an internship with these criteria. Redirecting you to it.',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Your virtual internship session has been created!',
      });
    }
    
    return result.sessionId;
  } catch (error) {
    console.error("❌ internshipService: Exception when calling edge function", error);
    
    // Try fallback method if edge function fails
    try {
      console.log("🔄 internshipService: Attempting fallback method via Supabase client");
      
      const { data: sessionData, error: insertError } = await supabase
        .from("internship_sessions")
        .insert({
          user_id: authSession.data.session.user.id,
          job_title: jobTitle,
          industry: industry,
          job_description: jobDescription || null,
          created_at: new Date().toISOString(),
          current_phase: 1,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("❌ internshipService: Fallback method failed:", insertError);
        throw insertError;
      }

      if (sessionData && sessionData.id) {
        console.log("✅ internshipService: Fallback method succeeded:", sessionData.id);
        toast({
          title: 'Success',
          description: 'Your virtual internship session has been created!',
        });
        return sessionData.id;
      }
      
      throw new Error("Failed to create session");
    } catch (fallbackError) {
      console.error("❌ internshipService: Fallback method error:", fallbackError);
      throw error; // throw the original error
    }
  }
}

/**
 * Generates tasks for an internship session using the edge function
 */
export async function generateTasksForSession(
  sessionId: string,
  jobTitle: string,
  industry: string
): Promise<Task[] | null> {
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
      job_title: jobTitle,
      industry: industry,
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
  
  return typedTasks;
}

/**
 * Updates a task's status to in-progress
 */
export async function resumeTaskById(taskId: string): Promise<boolean> {
  // Update the task status to in-progress
  const { error: updateError } = await supabase
    .from('internship_tasks')
    .update({ status: 'in_progress' })
    .eq('id', taskId);
  
  if (updateError) throw updateError;
  
  return true;
}

/**
 * Submits a task with its deliverable content
 */
export async function submitTaskContent(
  taskId: string,
  sessionId: string,
  content: string,
  attachmentUrl: string | null,
  attachmentName: string | null,
  jobTitle: string,
  industry: string
): Promise<{ deliverable: Deliverable, feedback: Feedback }> {
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
      task_id: taskId,
      session_id: sessionId,
      content: content,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
      job_title: jobTitle,
      industry: industry
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

  toast({
    title: 'Task Submitted',
    description: 'Your work has been submitted and feedback is available.',
  });
  
  return { deliverable: result.deliverable, feedback: result.feedback };
}

/**
 * Complete a phase and move to the next one
 */
export async function completeInternshipPhase(
  sessionId: string, 
  phaseNumber: number
): Promise<boolean> {
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

  toast({
    title: 'Phase Completed',
    description: `You have successfully completed phase ${phaseNumber} of your internship!`,
  });
  
  return true;
}
