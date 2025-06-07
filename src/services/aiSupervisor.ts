import { supabase } from "@/integrations/supabase/client";

interface SupervisorMessage {
  id: string;
  message_type: 'onboarding' | 'check_in' | 'feedback_followup' | 'reminder' | 'encouragement' | 'milestone';
  message_content: string;
  context_data: any;
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'cancelled';
}

interface SupervisorState {
  session_id: string;
  user_id: string;
  onboarding_completed: boolean;
  last_check_in_at?: string;
  total_interactions: number;
  last_interaction_at?: string;
  supervisor_name: string;
  supervisor_role: string;
}

export class AISupervisorService {
  
  // Initialize supervisor for a new session
  static async initializeSupervisor(sessionId: string, userId: string): Promise<SupervisorState> {
    try {
      // ✅ Check if supervisor state already exists using .limit(1)
      const { data: existingState } = await supabase
        .from('internship_supervisor_state')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .limit(1);

      if (existingState && existingState.length > 0) {
        return existingState[0] as SupervisorState;
      }

      // Create new supervisor state
      const { data: newState, error } = await supabase
        .from('internship_supervisor_state')
        .insert({
          session_id: sessionId,
          user_id: userId,
          onboarding_completed: false,
          total_interactions: 0,
          supervisor_name: 'Sarah Mitchell',
          supervisor_role: 'Internship Coordinator'
        })
        .select()
        .limit(1);

      if (error) throw error;

      if (!newState || newState.length === 0) {
        throw new Error('Failed to create supervisor state');
      }

      return newState[0] as SupervisorState;
    } catch (error) {
      console.error('Error initializing supervisor:', error);
      throw error;
    }
  }

  // Trigger onboarding message
  static async triggerOnboarding(sessionId: string, userId: string): Promise<void> {
    try {
      // ✅ Add validation before calling Edge Function
      if (!sessionId || sessionId === 'undefined' || sessionId === 'null' ||
          !userId || userId === 'undefined' || userId === 'null') {
        console.warn('Skipping onboarding trigger - invalid parameters:', { sessionId, userId });
        return;
      }

      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'onboarding',
          session_id: sessionId,
          user_id: userId
        }
      });

      if (error) {
        console.error('Error triggering onboarding:', error);
        // Fallback: create a basic welcome message
        await this.createFallbackOnboardingMessage(sessionId, userId);
      }
    } catch (error) {
      console.error('Error in onboarding trigger:', error);
      await this.createFallbackOnboardingMessage(sessionId, userId);
    }
  }

  // Trigger check-in message
  static async triggerCheckIn(sessionId: string, userId: string, taskId?: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'check_in',
          session_id: sessionId,
          user_id: userId,
          context: { task_id: taskId }
        }
      });

      if (error) {
        console.error('Error triggering check-in:', error);
      }
    } catch (error) {
      console.error('Error in check-in trigger:', error);
    }
  }

  // Trigger feedback followup
  static async triggerFeedbackFollowup(
    sessionId: string, 
    userId: string, 
    submissionId: string, 
    feedbackData: any
  ): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'feedback_followup',
          session_id: sessionId,
          user_id: userId,
          context: {
            submission_id: submissionId,
            feedback_data: feedbackData
          }
        }
      });

      if (error) {
        console.error('Error triggering feedback followup:', error);
      }
    } catch (error) {
      console.error('Error in feedback followup trigger:', error);
    }
  }

  // Get supervisor messages for a session
  static async getSupervisorMessages(sessionId: string, userId: string): Promise<SupervisorMessage[]> {
    try {
      const { data, error } = await supabase
        .from('internship_supervisor_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data as SupervisorMessage[];
    } catch (error) {
      console.error('Error fetching supervisor messages:', error);
      return [];
    }
  }

  // Get supervisor state
  static async getSupervisorState(sessionId: string, userId: string): Promise<SupervisorState | null> {
    try {
      // ✅ Use .limit(1) instead of .single() to avoid 406 errors
      const { data, error } = await supabase
        .from('internship_supervisor_state')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Error fetching supervisor state:', error);
        return null;
      }

      // ✅ Handle empty results gracefully
      if (!data || data.length === 0) {
        return null;
      }

      return data[0] as SupervisorState;
    } catch (error) {
      console.error('Error fetching supervisor state:', error);
      return null;
    }
  }

  // Schedule deadline reminders
  static async scheduleDeadlineReminders(sessionId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'schedule_reminder',
          session_id: sessionId,
          user_id: userId
        }
      });

      if (error) {
        console.error('Error scheduling reminders:', error);
      }
    } catch (error) {
      console.error('Error in reminder scheduling:', error);
    }
  }

  // Create fallback onboarding message when AI fails
  private static async createFallbackOnboardingMessage(sessionId: string, userId: string): Promise<void> {
    try {
      // ✅ Get session info with safe handling
      const { data: sessionData } = await supabase
        .from('internship_sessions')
        .select('job_title, industry')
        .eq('id', sessionId)
        .limit(1);

      // ✅ Get user info with safe handling
      const { data: userData } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .limit(1);

      const firstName = userData?.[0]?.first_name || 'there';
      const jobTitle = sessionData?.[0]?.job_title || 'intern';
      const industry = sessionData?.[0]?.industry || 'your field';

      const fallbackMessage = `Hi ${firstName}! 👋

Welcome to your virtual ${jobTitle} internship! I'm Sarah Mitchell, your internship coordinator, and I'm excited to work with you over the coming weeks.

You'll be gaining hands-on experience in the ${industry} industry through a series of practical tasks and projects. I'll be here to guide you, provide feedback, and make sure you're getting the most out of this experience.

Feel free to reach out if you have any questions or need help with anything. Let's make this a great learning experience!

Best regards,
Sarah`;

      // Store the fallback message
      await supabase
        .from('internship_supervisor_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          message_type: 'onboarding',
          message_content: fallbackMessage,
          context_data: { fallback: true },
          scheduled_for: new Date().toISOString(),
          status: 'sent',
          sent_at: new Date().toISOString()
        });

      // Update supervisor state
      await supabase
        .from('internship_supervisor_state')
        .upsert({
          session_id: sessionId,
          user_id: userId,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          total_interactions: 1,
          last_interaction_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error creating fallback onboarding message:', error);
    }
  }

  // Check if user needs onboarding
  static async shouldTriggerOnboarding(sessionId: string, userId: string): Promise<boolean> {
    try {
      const supervisorState = await this.getSupervisorState(sessionId, userId);
      
      if (!supervisorState) {
        await this.initializeSupervisor(sessionId, userId);
        return true;
      }

      return !supervisorState.onboarding_completed;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  // Mark interaction
  static async recordInteraction(
    sessionId: string, 
    userId: string, 
    interactionType: string, 
    context: any = {}
  ): Promise<void> {
    try {
      // ✅ Add validation to prevent foreign key constraint violations
      if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
        console.warn('Skipping interaction recording - invalid sessionId:', sessionId);
        return;
      }

      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('Skipping interaction recording - invalid userId:', userId);
        return;
      }

      // ✅ Verify the session exists before attempting to insert
      const { data: sessionExists } = await supabase
        .from('internship_sessions')
        .select('id')
        .eq('id', sessionId)
        .limit(1);

      if (!sessionExists || sessionExists.length === 0) {
        console.warn('Skipping interaction recording - session not found:', sessionId);
        return;
      }

      await supabase
        .from('internship_supervisor_interactions')
        .insert({
          session_id: sessionId,
          user_id: userId,
          interaction_type: interactionType,
          trigger_event: context.trigger_event || 'manual',
          context_snapshot: context
        });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  // Analyze user progress and suggest check-ins
  static async analyzeProgressAndSuggestCheckIns(sessionId: string, userId: string): Promise<{
    shouldCheckIn: boolean;
    reason: string;
    taskId?: string;
  }> {
    try {
      // Get current task status
      const { data: tasks } = await supabase
        .from('internship_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('task_order');

      // Get submissions
      const { data: submissions } = await supabase
        .from('internship_task_submissions')
        .select('task_id, created_at')
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      // ✅ Get last check-in with safe handling 
      const { data: lastCheckInData } = await supabase
        .from('internship_supervisor_messages')
        .select('sent_at')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('message_type', 'check_in')
        .order('sent_at', { ascending: false })
        .limit(1);

      const lastCheckIn = lastCheckInData?.[0];

      if (!tasks || tasks.length === 0) {
        return { shouldCheckIn: false, reason: 'No tasks available' };
      }

      const submittedTaskIds = new Set(submissions?.map(s => s.task_id) || []);
      const incompleteTasks = tasks.filter(task => 
        !submittedTaskIds.has(task.id) && task.status !== 'completed'
      );

      // Check if it's been more than 3 days since last check-in
      const daysSinceLastCheckIn = lastCheckIn 
        ? Math.floor((Date.now() - new Date(lastCheckIn.sent_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Find overdue tasks
      const overdueTasks = incompleteTasks.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate < new Date();
      });

      // Find tasks due soon
      const soonDueTasks = incompleteTasks.filter(task => {
        const dueDate = new Date(task.due_date);
        const daysToDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysToDue <= 2 && daysToDue > 0;
      });

      if (overdueTasks.length > 0) {
        return {
          shouldCheckIn: true,
          reason: 'Overdue tasks detected',
          taskId: overdueTasks[0].id
        };
      }

      if (soonDueTasks.length > 0 && daysSinceLastCheckIn >= 1) {
        return {
          shouldCheckIn: true,
          reason: 'Tasks due soon',
          taskId: soonDueTasks[0].id
        };
      }

      if (daysSinceLastCheckIn >= 3 && incompleteTasks.length > 0) {
        return {
          shouldCheckIn: true,
          reason: 'Regular check-in due',
          taskId: incompleteTasks[0].id
        };
      }

      return { shouldCheckIn: false, reason: 'No check-in needed' };

    } catch (error) {
      console.error('Error analyzing progress:', error);
      return { shouldCheckIn: false, reason: 'Analysis error' };
    }
  }

  // Schedule team member introductions 
  static async scheduleTeamIntroductions(sessionId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'schedule_team_introductions',
          session_id: sessionId,
          user_id: userId
        }
      });

      if (error) {
        console.error('Error scheduling team introductions:', error);
      }
    } catch (error) {
      console.error('Error in team introductions scheduling:', error);
    }
  }

  // Schedule specific team interaction
  static async scheduleTeamInteraction(
    sessionId: string, 
    userId: string, 
    interactionType: string,
    teamMember?: any
  ): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'schedule_team_interaction',
          session_id: sessionId,
          user_id: userId,
          context: {
            interaction_type: interactionType,
            team_member: teamMember
          }
        }
      });

      if (error) {
        console.error('Error scheduling team interaction:', error);
      }
    } catch (error) {
      console.error('Error in team interaction scheduling:', error);
    }
  }

  // Process pending team messages (should be called periodically)
  static async processTeamMessages(): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'process_team_messages'
        }
      });

      if (error) {
        console.error('Error processing team messages:', error);
      }
    } catch (error) {
      console.error('Error in team message processing:', error);
    }
  }

  // Get team member messages for display
  static async getTeamMessages(sessionId: string, userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('internship_supervisor_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .not('sender_persona->name', 'eq', 'Sarah Mitchell') // Exclude supervisor messages
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching team messages:', error);
      return [];
    }
  }

  // Check if user should get team introductions
  static async shouldScheduleTeamIntroductions(sessionId: string, userId: string): Promise<boolean> {
    try {
      // Check if team introductions have already been scheduled
      const { data: existingSchedules } = await supabase
        .from('internship_team_schedules')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('interaction_type', 'introduction');

      // Check if supervisor onboarding is complete
      const supervisorState = await this.getSupervisorState(sessionId, userId);
      
      return (
        supervisorState?.onboarding_completed && 
        (!existingSchedules || existingSchedules.length === 0)
      );
    } catch (error) {
      console.error('Error checking team introduction status:', error);
      return false;
    }
  }

  // Determine what team interactions to schedule based on user progress
  static async analyzeAndScheduleTeamInteractions(sessionId: string, userId: string): Promise<void> {
    try {
      // Get user progress
      const { data: tasks } = await supabase
        .from('internship_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('task_order');

      const { data: submissions } = await supabase
        .from('internship_task_submissions')
        .select('task_id, created_at')
        .eq('session_id', sessionId)
        .eq('user_id', userId);

      const completedTasks = submissions?.length || 0;
      const totalTasks = tasks?.length || 0;

      // Schedule interactions based on progress milestones
      if (completedTasks >= 2 && Math.random() < 0.3) {
        // 30% chance of project assignment message after 2+ tasks
        await this.scheduleTeamInteraction(sessionId, userId, 'project_assignment');
      }

      if (completedTasks >= 3 && Math.random() < 0.4) {
        // 40% chance of collaboration invite after 3+ tasks
        await this.scheduleTeamInteraction(sessionId, userId, 'collaboration');
      }

      // Random casual check-ins
      if (Math.random() < 0.2) {
        // 20% chance of casual check-in
        await this.scheduleTeamInteraction(sessionId, userId, 'casual_check_in');
      }

      // Meeting invites for engaged users
      if (completedTasks >= 1 && Math.random() < 0.3) {
        // 30% chance of meeting invite after first task
        await this.scheduleTeamInteraction(sessionId, userId, 'meeting_invite');
      }

    } catch (error) {
      console.error('Error analyzing team interactions:', error);
    }
  }
} 