import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// Supervisor Scan - Cron Job for Proactive Messaging
// ============================================================================
// This function runs every 30-60 minutes via Supabase cron
// It proactively scans all active sessions and triggers messages for:
// - Onboarding (if not completed)
// - Reminders (T-24h before task due)
// - Check-ins (48h inactivity)
// ============================================================================

interface ScanResult {
  scanned: number;
  onboarding_triggered: number;
  reminders_sent: number;
  check_ins_sent: number;
  errors: number;
  duration_ms: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  const result: ScanResult = {
    scanned: 0,
    onboarding_triggered: 0,
    reminders_sent: 0,
    check_ins_sent: 0,
    errors: 0,
    duration_ms: 0
  };

  try {
    console.log('🔍 Starting supervisor scan...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active sessions (created in last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: activeSessions, error: sessionsError } = await supabase
      .from('internship_sessions')
      .select('id, user_id, created_at')
      .gte('created_at', ninetyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(100); // Process in batches

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      throw sessionsError;
    }

    if (!activeSessions || activeSessions.length === 0) {
      console.log('No active sessions found');
      result.duration_ms = Date.now() - startTime;
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Scanning ${activeSessions.length} active sessions...`);
    result.scanned = activeSessions.length;

    // Process each session
    for (const session of activeSessions) {
      try {
        // 1. Check onboarding status
        await checkOnboarding(supabase, session, result);

        // 2. Check for reminder needs (tasks due in ~24h)
        await checkReminders(supabase, session, result);

        // 3. Check for inactivity (48h no activity)
        await checkInactivity(supabase, session, result);

      } catch (error) {
        console.error(`Error processing session ${session.id}:`, error);
        result.errors++;
      }
    }

    result.duration_ms = Date.now() - startTime;
    console.log(`✅ Scan complete:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Scan error:', error);
    result.duration_ms = Date.now() - startTime;
    result.errors++;
    
    return new Response(JSON.stringify({ 
      error: error.message,
      result 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})

/**
 * Check if session needs onboarding message
 */
async function checkOnboarding(supabase: any, session: any, result: ScanResult): Promise<void> {
  const { data: state } = await supabase
    .from('internship_supervisor_state')
    .select('onboarding_completed')
    .eq('session_id', session.id)
    .eq('user_id', session.user_id)
    .limit(1)
    .single();

  // If no state or onboarding not completed, trigger it
  if (!state || !state.onboarding_completed) {
    console.log(`📨 Triggering onboarding for session ${session.id}`);
    
    const { error } = await supabase.functions.invoke('ai-supervisor', {
      body: {
        action: 'onboarding',
        session_id: session.id,
        user_id: session.user_id
      }
    });

    if (error) {
      console.error('Onboarding trigger error:', error);
    } else {
      result.onboarding_triggered++;
    }
  }
}

/**
 * Check for tasks that need reminders (T-24h)
 */
async function checkReminders(supabase: any, session: any, result: ScanResult): Promise<void> {
  // Get tasks due in the next 18-30 hours (window for T-24h)
  const now = new Date();
  const windowStart = new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 30 * 60 * 60 * 1000).toISOString();

  const { data: tasksDue } = await supabase
    .from('internship_tasks')
    .select('id, title, due_date, status')
    .eq('session_id', session.id)
    .neq('status', 'completed')
    .gte('due_date', windowStart)
    .lte('due_date', windowEnd);

  if (!tasksDue || tasksDue.length === 0) return;

  // Check each task to see if reminder already sent
  for (const task of tasksDue) {
    const idemKey = `reminder:${session.id}:${session.user_id}:${task.id}`;
    
    // Check if reminder already exists for this task
    const { data: existingReminder } = await supabase
      .from('internship_supervisor_messages')
      .select('id')
      .eq('idem_key', idemKey)
      .limit(1);

    if (!existingReminder || existingReminder.length === 0) {
      console.log(`⏰ Sending reminder for task ${task.id} in session ${session.id}`);
      
      const { error } = await supabase.functions.invoke('ai-supervisor', {
        body: {
          action: 'reminder',
          session_id: session.id,
          user_id: session.user_id,
          context: { task_id: task.id }
        }
      });

      if (error) {
        console.error('Reminder trigger error:', error);
      } else {
        result.reminders_sent++;
      }
    }
  }
}

/**
 * Check for inactivity and send check-in if needed
 */
async function checkInactivity(supabase: any, session: any, result: ScanResult): Promise<void> {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Check for any recent activity (messages or submissions)
  const { data: recentMessages } = await supabase
    .from('internship_supervisor_messages')
    .select('id')
    .eq('session_id', session.id)
    .eq('user_id', session.user_id)
    .eq('direction', 'inbound')
    .gte('sent_at', fortyEightHoursAgo)
    .limit(1);

  const { data: recentSubmissions } = await supabase
    .from('internship_task_submissions')
    .select('id')
    .eq('session_id', session.id)
    .eq('user_id', session.user_id)
    .gte('created_at', fortyEightHoursAgo)
    .limit(1);

  // If there's recent activity, no need for check-in
  if ((recentMessages && recentMessages.length > 0) || 
      (recentSubmissions && recentSubmissions.length > 0)) {
    return;
  }

  // Check if there are active tasks (only send check-in if there are tasks to work on)
  const { data: activeTasks } = await supabase
    .from('internship_tasks')
    .select('id')
    .eq('session_id', session.id)
    .neq('status', 'completed')
    .limit(1);

  if (!activeTasks || activeTasks.length === 0) {
    return; // No tasks, no need for check-in
  }

  // Check if we already sent a check-in recently (within last 48h)
  const { data: recentCheckIn } = await supabase
    .from('internship_supervisor_messages')
    .select('id')
    .eq('session_id', session.id)
    .eq('user_id', session.user_id)
    .eq('message_type', 'check_in')
    .eq('direction', 'outbound')
    .gte('sent_at', fortyEightHoursAgo)
    .limit(1);

  if (recentCheckIn && recentCheckIn.length > 0) {
    return; // Already sent check-in recently
  }

  console.log(`📝 Sending inactivity check-in for session ${session.id}`);
  
  const { error } = await supabase.functions.invoke('ai-supervisor', {
    body: {
      action: 'check_in',
      session_id: session.id,
      user_id: session.user_id,
      context: { task_id: activeTasks[0].id }
    }
  });

  if (error) {
    console.error('Check-in trigger error:', error);
  } else {
    result.check_ins_sent++;
  }
}

