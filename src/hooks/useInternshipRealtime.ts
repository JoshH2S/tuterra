import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook for real-time updates to internship data
 * 
 * @param sessionId - The internship session ID to subscribe to
 * @param onTasksUpdate - Callback when tasks are updated
 * @param onMessagesUpdate - Callback when messages are updated
 * @param onFeedbackUpdate - Callback when feedback is updated
 */
export function useInternshipRealtime({
  sessionId,
  onTasksUpdate,
  onMessagesUpdate,
  onFeedbackUpdate,
}: {
  sessionId: string;
  onTasksUpdate?: () => void;
  onMessagesUpdate?: () => void;
  onFeedbackUpdate?: () => void;
}) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    // Create a new realtime channel
    const realtimeChannel = supabase
      .channel(`internship-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'internship_tasks',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        console.log('Task change received:', payload);
        if (onTasksUpdate) onTasksUpdate();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'internship_messages',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        console.log('Message change received:', payload);
        if (onMessagesUpdate) onMessagesUpdate();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'internship_task_submissions',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        console.log('Submission change received:', payload);
        if (onFeedbackUpdate) onFeedbackUpdate();
      });

    // Subscribe to the channel
    realtimeChannel.subscribe((status) => {
      console.log('Realtime subscription status:', status);
      setConnected(status === 'SUBSCRIBED');
    });

    setChannel(realtimeChannel);

    // Cleanup function
    return () => {
      console.log('Unsubscribing from realtime channel');
      realtimeChannel.unsubscribe();
    };
  }, [sessionId, onTasksUpdate, onMessagesUpdate, onFeedbackUpdate]);

  return { connected };
} 