import { supabase } from "@/integrations/supabase/client";

export interface ThreadMessage {
  id: string;
  content: string;
  subject?: string;
  sender_type: 'supervisor' | 'team' | 'intern';
  sender_name: string;
  sender_role?: string;
  sender_department?: string;
  sender_avatar_style?: string;
  sent_at: string;
  status: 'sent' | 'read' | 'failed';
  context_data?: any;
  responses?: InternResponse[];
}

export interface InternResponse {
  id: string;
  content: string;
  received_at: string;
  processed: boolean;
  processing_status: 'pending' | 'processed' | 'failed' | 'escalated';
  auto_response_generated: boolean;
  escalation_reason?: string;
}

export interface ResponseMetrics {
  total_pending: number;
  total_processed: number;
  total_escalated: number;
  total_failed: number;
  avg_processing_time_minutes: number;
  escalation_rate: number;
}

export interface SessionResponseStats {
  session_id: string;
  total_messages: number;
  total_responses: number;
  response_rate: number;
  avg_response_time_hours: number;
  pending_responses: number;
}

export class ThreadedMessagingService {
  /**
   * Get the threaded conversation for a session
   */
  static async getThread(sessionId: string): Promise<ThreadMessage[]> {
    try {
      const response = await fetch(`/api/internship/${sessionId}/thread`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load thread');
      }

      return data.thread;
    } catch (error) {
      console.error('Error loading thread:', error);
      throw error;
    }
  }

  /**
   * Submit a reply to a message
   */
  static async submitReply(
    sessionId: string, 
    messageId: string, 
    content: string
  ): Promise<{ success: boolean; response_id?: string; message?: string }> {
    try {
      const response = await fetch(`/api/internship/${sessionId}/messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content.trim() })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send reply');
      }

      return data;
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  static async markAsRead(sessionId: string, messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/internship/${sessionId}/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  /**
   * Get response processing metrics (admin function)
   */
  static async getResponseMetrics(): Promise<ResponseMetrics | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_response_processing_metrics');

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting response metrics:', error);
      return null;
    }
  }

  /**
   * Get response stats for a specific session
   */
  static async getSessionResponseStats(sessionId: string): Promise<SessionResponseStats | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_session_response_stats', { p_session_id: sessionId });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting session response stats:', error);
      return null;
    }
  }

  /**
   * Get all responses for monitoring (admin function)
   */
  static async getResponseDashboard(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('response_processing_dashboard')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting response dashboard:', error);
      return [];
    }
  }

  /**
   * Manually trigger response processing (admin function)
   */
  static async triggerResponseProcessing(responseId?: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('process-internship-responses', {
        body: responseId ? { response_id: responseId } : { batch_process: true }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error triggering response processing:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time updates for a session
   */
  static subscribeToThread(
    sessionId: string, 
    onNewMessage: (message: any) => void,
    onNewResponse: (response: any) => void
  ) {
    const channel = supabase
      .channel(`internship_messages_${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'internship_messages_v2',
        filter: `session_id=eq.${sessionId}`
      }, onNewMessage)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'internship_responses',
        filter: `session_id=eq.${sessionId}`
      }, onNewResponse)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Get message count and unread status for a session
   */
  static async getMessageSummary(sessionId: string): Promise<{
    total_messages: number;
    unread_messages: number;
    last_message_at?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('internship_messages_v2')
        .select('id, status, sent_at')
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      const total_messages = data?.length || 0;
      const unread_messages = data?.filter(m => m.status === 'sent').length || 0;
      const last_message_at = data && data.length > 0 ? data[0].sent_at : undefined;

      return {
        total_messages,
        unread_messages,
        last_message_at
      };
    } catch (error) {
      console.error('Error getting message summary:', error);
      return {
        total_messages: 0,
        unread_messages: 0
      };
    }
  }

  /**
   * Update app configuration (admin function)
   */
  static async updateAppConfig(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('app_config')
        .upsert({ 
          key, 
          value, 
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating app config:', error);
      return false;
    }
  }

  /**
   * Get app configuration value
   */
  static async getAppConfig(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', key)
        .single();

      if (error) throw error;
      return data?.value || null;
    } catch (error) {
      console.error('Error getting app config:', error);
      return null;
    }
  }
} 