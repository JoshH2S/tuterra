import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// AI Supervisor Service (MVP - Simplified)
// ============================================================================
// This service provides a clean interface to the ai-supervisor Edge Function.
// All idempotency and business logic is handled server-side.
// ============================================================================

interface SupervisorMessage {
  id: string;
  message_type: 'onboarding' | 'check_in' | 'feedback_followup' | 'reminder';
  subject?: string;
  message_content: string;
  direction: 'outbound' | 'inbound';
  sender_type: 'supervisor' | 'user' | 'system';
  context_data: any;
  sent_at?: string;
  is_read: boolean;
  status: 'pending' | 'sent' | 'cancelled';
}

interface SupervisorState {
  session_id: string;
  user_id: string;
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
  last_check_in_at?: string;
  total_interactions: number;
  last_interaction_at?: string;
  supervisor_name: string;
  supervisor_role: string;
}

export class AISupervisorService {
  
  /**
   * Initialize supervisor for a new session
   */
  static async initializeSupervisor(sessionId: string, userId: string): Promise<SupervisorState> {
    try {
      // Check if supervisor state already exists
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

  /**
   * Trigger onboarding message (idempotent - safe to call multiple times)
   */
  static async triggerOnboarding(sessionId: string, userId: string): Promise<void> {
    try {
      if (!sessionId || !userId || sessionId === 'undefined' || userId === 'undefined') {
        console.warn('Invalid parameters for onboarding trigger');
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
        await this.createFallbackOnboardingMessage(sessionId, userId);
      }
    } catch (error) {
      console.error('Error in onboarding trigger:', error);
      await this.createFallbackOnboardingMessage(sessionId, userId);
    }
  }

  /**
   * Trigger check-in message (simplified - idempotency handled server-side)
   */
  static async triggerCheckIn(sessionId: string, userId: string, taskId?: string): Promise<void> {
    try {
      if (!sessionId || !userId) {
        console.warn('Invalid parameters for check-in trigger');
        return;
      }

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

  /**
   * Trigger feedback follow-up message
   */
  static async triggerFeedbackFollowup(
    sessionId: string, 
    userId: string, 
    submissionId: string, 
    feedbackData: any
  ): Promise<void> {
    try {
      if (!sessionId || !userId || !submissionId) {
        console.warn('Invalid parameters for feedback followup');
        return;
      }

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

  /**
   * Trigger deadline reminder for a specific task
   */
  static async triggerReminder(sessionId: string, userId: string, taskId: string): Promise<void> {
    try {
      if (!sessionId || !userId || !taskId) {
        console.warn('Invalid parameters for reminder trigger');
        return;
      }

      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'reminder',
          session_id: sessionId,
          user_id: userId,
          context: { task_id: taskId }
        }
      });

      if (error) {
        console.error('Error triggering reminder:', error);
      }
    } catch (error) {
      console.error('Error in reminder trigger:', error);
    }
  }

  /**
   * Get supervisor messages for a session (inbox view)
   */
  static async getSupervisorMessages(sessionId: string, userId: string): Promise<SupervisorMessage[]> {
    try {
      const { data, error } = await supabase
        .from('internship_supervisor_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Map the database response to SupervisorMessage interface
      return (data || []).map((msg: any) => ({
        id: msg.id,
        message_type: msg.message_type as 'onboarding' | 'check_in' | 'feedback_followup' | 'reminder',
        subject: msg.subject || undefined,
        message_content: msg.message_content,
        direction: (msg.direction || 'outbound') as 'outbound' | 'inbound',
        sender_type: (msg.sender_type || 'supervisor') as 'supervisor' | 'user' | 'system',
        context_data: msg.context_data,
        sent_at: msg.sent_at || undefined,
        is_read: msg.is_read || false,
        status: msg.status as 'pending' | 'sent' | 'cancelled'
      }));
    } catch (error) {
      console.error('Error fetching supervisor messages:', error);
      return [];
    }
  }

  /**
   * Get supervisor state
   */
  static async getSupervisorState(sessionId: string, userId: string): Promise<SupervisorState | null> {
    try {
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

      if (!data || data.length === 0) {
        return null;
      }

      return data[0] as SupervisorState;
    } catch (error) {
      console.error('Error fetching supervisor state:', error);
      return null;
    }
  }

  /**
   * Check if user needs onboarding
   */
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

  /**
   * Mark message as read
   */
  static async markMessageRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('internship_supervisor_messages')
        .update({ status: 'sent' })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
      }
    } catch (error) {
      console.error('Error in markMessageRead:', error);
    }
  }

  /**
   * Send user reply to supervisor and trigger AI response
   */
  static async sendUserReply(
    sessionId: string,
    userId: string,
    subject: string,
    content: string,
    threadId?: string,
    taskId?: string
  ): Promise<void> {
    try {
      // 1. Save user message
      const { data: userMessage, error } = await supabase
        .from('internship_supervisor_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          message_type: 'user_message',
          subject: subject,
          message_content: content,
          direction: 'inbound',
          sender_type: 'user',
          thread_id: threadId,
          status: 'sent',
          sent_at: new Date().toISOString(),
          is_read: false,
          context_data: { task_id: taskId }
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending user reply:', error);
        throw error;
      }

      // 2. Trigger AI response immediately
      const { error: responseError } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'user_message_response',
          session_id: sessionId,
          user_id: userId,
          context: {
            user_message_id: userMessage.id,
            user_message_content: content,
            user_message_subject: subject,
            task_id: taskId,
            thread_id: threadId
          }
        }
      });

      if (responseError) {
        console.error('Error triggering AI response:', responseError);
        // Don't throw - user message was saved successfully
      }
    } catch (error) {
      console.error('Error in sendUserReply:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(sessionId: string, userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('internship_supervisor_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('status', 'sent');

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * Fallback onboarding message when AI fails
   */
  private static async createFallbackOnboardingMessage(sessionId: string, userId: string): Promise<void> {
    try {
      const { data: sessionData } = await supabase
        .from('internship_sessions')
        .select('job_title, industry')
        .eq('id', sessionId)
        .limit(1);

      const { data: userData } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .limit(1);

      // Get company name with same logic as dashboard
      const { data: companyData } = await supabase
        .from('internship_company_profiles')
        .select('company_name')
        .eq('session_id', sessionId)
        .eq('profile_status', 'completed')
        .limit(1);

      let companyName = 'the company';
      if (companyData && companyData.length > 0) {
        companyName = companyData[0].company_name;
      } else {
        // Try fallback to company details
        const { data: companyDetails } = await supabase
          .from('internship_company_details')
          .select('name')
          .eq('session_id', sessionId)
          .limit(1);
        
        if (companyDetails && companyDetails.length > 0) {
          companyName = companyDetails[0].name;
        } else {
          // Final fallback based on industry
          const industry = sessionData?.[0]?.industry || 'Technology';
          companyName = `${industry} Corporation`;
        }
      }

      const firstName = userData?.[0]?.first_name || 'there';
      const jobTitle = sessionData?.[0]?.job_title || 'intern';
      const industry = sessionData?.[0]?.industry || 'your field';

      const fallbackMessage = `Hi ${firstName}! 👋

Welcome to your virtual ${jobTitle} internship at ${companyName}! I'm Sarah Mitchell, your internship coordinator, and I'm excited to work with you over the coming weeks.

You'll be gaining hands-on experience in the ${industry} industry through a series of practical tasks and projects. I'll be here to guide you, provide feedback, and make sure you're getting the most out of this experience.

**Need help with a specific task?** Simply reply to this message and mention the task title. I'm here to assist you throughout your internship journey with:
• Task clarification and guidance
• Feedback on your work
• Industry insights and best practices
• Career advice and mentorship

Feel free to reach out anytime with questions or if you need guidance on any aspect of your work. I'm here to support your success!

Best regards,
Sarah Mitchell
Internship Coordinator`;

      // Try to create an idempotency key to prevent duplicates
      const idemKey = `fallback-onboarding:${sessionId}:${userId}:na`;

      await supabase
        .from('internship_supervisor_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          message_type: 'onboarding',
          subject: '🌟 Welcome to Your Virtual Internship!',
          message_content: fallbackMessage,
          direction: 'outbound',
          sender_type: 'supervisor',
          context_data: { fallback: true },
          status: 'sent',
          sent_at: new Date().toISOString(),
          idem_key: idemKey
        });

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
}