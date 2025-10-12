import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// MVP Configuration
// ============================================================================
const CONFIG = {
  AI_TIMEOUT_MS: 9000,
  AI_MODEL: 'gpt-4o-mini',
  AI_MAX_TOKENS: 180,
  AI_TEMPERATURE: 0.5,
  DAILY_CAPS: {
    max_check_ins_per_day: 1,
    max_outbound_per_day: 3
  }
}

interface SupervisorRequest {
  action: 'onboarding' | 'check_in' | 'feedback_followup' | 'reminder' | 'user_message_response';
  session_id: string;
  user_id: string;
  context?: {
    task_id?: string;
    submission_id?: string;
    feedback_data?: any;
    user_message_id?: string;
    user_message_content?: string;
    user_message_subject?: string;
    thread_id?: string;
  };
}

interface SupervisorContext {
  session_id: string;
  user_id: string;
  user_first_name: string;
  job_title: string;
  industry: string;
  company_name: string;
  supervisor_state: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    if (!body || body.trim() === '') {
      return new Response(JSON.stringify({ error: 'Empty request body' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const requestData: SupervisorRequest = JSON.parse(body)
    const { action, session_id, user_id, context = {} } = requestData

    if (!action || !session_id || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log(`🎯 Action: ${action} | Session: ${session_id} | User: ${user_id}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const ctx = await gatherMinimalContext(supabase, session_id, user_id)

    let result;
    switch (action) {
      case 'onboarding': result = await handleOnboarding(supabase, ctx, context); break
      case 'check_in': result = await handleCheckIn(supabase, ctx, context); break
      case 'feedback_followup': result = await handleFeedbackFollowup(supabase, ctx, context); break
      case 'reminder': result = await handleReminder(supabase, ctx, context); break
      case 'user_message_response': result = await handleUserMessageResponse(supabase, ctx, context); break
      default: throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})

function mkIdem(action: string, sessionId: string, userId: string, extra = 'na'): string {
  return `${action}:${sessionId}:${userId}:${extra}`;
}

function daysUntil(dateIso: string): number {
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
}

function generateSubject(messageType: string, context?: any): string {
  switch (messageType) {
    case 'onboarding': return '🌟 Welcome to Your Virtual Internship!';
    case 'check_in': return '📝 Check-in: How are things going?';
    case 'feedback_followup': return '💬 Feedback on Your Recent Submission';
    case 'reminder':
      const days = context?.days_until_due;
      if (days === 1) return '⏰ Reminder: Task Due Tomorrow';
      if (days === 0) return '🚨 Reminder: Task Due Today';
      return `⏰ Reminder: Task Due in ${days} Days`;
    default: return 'Message from Internship Coordinator';
  }
}

async function callOpenAI(messages: any[], max_tokens = CONFIG.AI_MAX_TOKENS, temperature = CONFIG.AI_TEMPERATURE): Promise<string | null> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), CONFIG.AI_TIMEOUT_MS);
  
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: CONFIG.AI_MODEL, max_tokens, temperature, messages }),
      signal: ctrl.signal
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const json = await res.json();
    return json?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    clearTimeout(timeout);
    console.error('OpenAI failed:', error);
    return null;
  }
}

async function renderTemplateOrFallback(template: string, vars: Record<string, any>, fallback: string): Promise<string> {
  let prompt = template ?? '';
  for (const [k, v] of Object.entries(vars)) {
    prompt = prompt.replace(new RegExp(`{${k}}`, 'g'), String(v ?? ''));
  }

  const content = await callOpenAI([
    { role: 'system', content: 'You are Sarah Mitchell, internship coordinator. Write 110-160 words in plain text email format. Lists: use "1. " or "- ". FORBIDDEN characters: ** (bold), * (italic), __ (underline), ` (code), ## (headers). If you use any asterisks, underscores, backticks, or hashtags for formatting, the message will fail to send. No new facts beyond the context provided.' },
    { role: 'user', content: prompt }
  ], 180, 0.5);

  return content || fallback;
}

async function gatherMinimalContext(supabase: any, sessionId: string, userId: string): Promise<SupervisorContext> {
  const [
    { data: userData },
    { data: sessionData },
    { data: companyData },
    { data: supervisorStateData }
  ] = await Promise.all([
    supabase.from('profiles').select('first_name').eq('id', userId).limit(1).single(),
    supabase.from('internship_sessions').select('job_title, industry').eq('id', sessionId).limit(1).single(),
    supabase.from('internship_company_profiles').select('company_name').eq('session_id', sessionId).limit(1),
    supabase.from('internship_supervisor_state').select('*').eq('session_id', sessionId).eq('user_id', userId).limit(1)
  ]);

    return {
    session_id: sessionId,
    user_id: userId,
    user_first_name: userData?.first_name || 'there',
      job_title: sessionData?.job_title || 'Intern',
      industry: sessionData?.industry || 'Technology',
    company_name: companyData?.[0]?.company_name || 'the company',
    supervisor_state: supervisorStateData?.[0] || null
  };
}

async function getRelevantTask(supabase: any, sessionId: string, taskId?: string): Promise<any | null> {
  if (taskId) {
    const { data } = await supabase.from('internship_tasks').select('id, title, due_date, status').eq('id', taskId).single();
    return data;
  }

  const { data } = await supabase.from('internship_tasks')
    .select('id, title, due_date, status')
    .eq('session_id', sessionId)
    .neq('status', 'completed')
    .order('due_date', { ascending: true })
    .limit(1);

  return data?.[0] || null;
}

async function checkDailyCaps(supabase: any, sessionId: string, userId: string, messageType: string): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayMessages } = await supabase
    .from('internship_supervisor_messages')
    .select('id, message_type')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .eq('direction', 'outbound')
    .gte('sent_at', todayStart.toISOString());

  const totalToday = todayMessages?.length || 0;
  const checkInsToday = todayMessages?.filter((m: any) => m.message_type === 'check_in').length || 0;

  if (totalToday >= CONFIG.DAILY_CAPS.max_outbound_per_day) {
    console.log(`Daily cap reached for user ${userId}`);
    return false;
  }

  if (messageType === 'check_in' && checkInsToday >= CONFIG.DAILY_CAPS.max_check_ins_per_day) {
    console.log(`Check-in cap reached for user ${userId}`);
    return false;
  }

  return true;
}

async function handleOnboarding(supabase: any, context: SupervisorContext, requestContext: any) {
  const startTime = Date.now();
  const idem_key = mkIdem('onboarding', context.session_id, context.user_id);

  try {
    if (context.supervisor_state?.onboarding_completed) {
      return { message: 'Onboarding already completed', skipped: true };
    }

    const { data: template } = await supabase
      .from('internship_supervisor_templates')
      .select('prompt_template')
      .eq('template_type', 'onboarding')
      .eq('template_name', 'welcome_introduction')
      .eq('active', true)
      .limit(1)
      .single();

    const templateText = template?.prompt_template || 
      'Write a warm welcome message for {user_name} starting as a {job_title} at {company_name} in the {industry} industry.';

    const variables = {
      user_name: context.user_first_name,
      job_title: context.job_title,
      company_name: context.company_name,
      industry: context.industry
    };

    const fallback = `Hi ${context.user_first_name}! 👋

Welcome to your virtual ${context.job_title} internship at ${context.company_name}! I'm Sarah Mitchell, your internship coordinator, and I'm excited to work with you over the coming weeks.

You'll be gaining hands-on experience in the ${context.industry} industry through a series of practical tasks and projects. I'll be here to guide you, provide feedback, and make sure you're getting the most out of this experience.

Feel free to reach out if you have any questions or need help with anything. Let's make this a great learning experience!

Best regards,
Sarah Mitchell
Internship Coordinator`;

    const messageContent = await renderTemplateOrFallback(templateText, variables, fallback);
    const subject = generateSubject('onboarding');

    const { data: message, error } = await supabase
      .from('internship_supervisor_messages')
      .insert({
        session_id: context.session_id,
        user_id: context.user_id,
        message_type: 'onboarding',
        subject,
        message_content: messageContent,
        direction: 'outbound',
        sender_type: 'supervisor',
        context_data: { variables },
        status: 'sent',
        sent_at: new Date().toISOString(),
        idem_key
      })
      .select()
      .single();

    if (error?.code === '23505') {
      return { message: 'Onboarding already sent', skipped: true };
    }
    if (error) throw error;

    await supabase.rpc('increment_interactions', { p_session: context.session_id, p_user: context.user_id, p_inc: 1 });
    await supabase.from('internship_supervisor_state').upsert({
      session_id: context.session_id,
      user_id: context.user_id,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString()
      });

    console.log(`✅ Onboarding sent in ${Date.now() - startTime}ms`);
    return { message: 'Onboarding sent', message_id: message.id, duration_ms: Date.now() - startTime };
  } catch (error) {
    console.error('Onboarding error:', error);
    throw error;
  }
}

async function handleCheckIn(supabase: any, context: SupervisorContext, requestContext: any) {
  const startTime = Date.now();
  const { task_id } = requestContext;

  try {
    const canSend = await checkDailyCaps(supabase, context.session_id, context.user_id, 'check_in');
    if (!canSend) return { message: 'Daily cap reached', skipped: true };

    const task = await getRelevantTask(supabase, context.session_id, task_id);
    if (!task) return { message: 'No task found', skipped: true };

    const idem_key = mkIdem('check_in', context.session_id, context.user_id, task.id);

    const recentCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: recentCheckIn } = await supabase
      .from('internship_supervisor_messages')
      .select('id')
      .eq('message_type', 'check_in')
      .eq('session_id', context.session_id)
      .eq('user_id', context.user_id)
      .contains('context_data', { task_id: task.id })
      .gte('sent_at', recentCutoff)
      .limit(1);

    if (recentCheckIn?.length > 0) {
      return { message: 'Recent check-in exists', skipped: true };
    }

    const daysUntilDue = daysUntil(task.due_date);

    const { data: template } = await supabase
    .from('internship_supervisor_templates')
      .select('prompt_template')
    .eq('template_type', 'check_in')
    .eq('template_name', 'task_progress_check')
    .eq('active', true)
      .limit(1)
      .single();

    const templateText = template?.prompt_template || 'Write a check-in for {user_name} about {task_title}.';
    const variables = { user_name: context.user_first_name, task_title: task.title, days_until_due: daysUntilDue };

    const fallback = `Hi ${context.user_first_name},

I wanted to check in on your progress with "${task.title}". ${
  daysUntilDue === 1 ? "This task is due tomorrow" :
  daysUntilDue === 0 ? "This task is due today" :
  daysUntilDue < 0 ? "This task is overdue" :
  `This task is due in ${daysUntilDue} days`
}.

How are things going? Let me know if you need any support.

Best regards,
Sarah Mitchell`;

    const messageContent = await renderTemplateOrFallback(templateText, variables, fallback);
    const subject = generateSubject('check_in');

    const { data: message, error } = await supabase
    .from('internship_supervisor_messages')
    .insert({
        session_id: context.session_id,
        user_id: context.user_id,
      message_type: 'check_in',
        subject,
      message_content: messageContent,
        direction: 'outbound',
        sender_type: 'supervisor',
        context_data: { variables, task_id: task.id },
      status: 'sent',
        sent_at: new Date().toISOString(),
        idem_key
    })
    .select()
      .single();

    if (error?.code === '23505') return { message: 'Check-in already sent', skipped: true };
    if (error) throw error;

    await supabase.rpc('increment_interactions', { p_session: context.session_id, p_user: context.user_id, p_inc: 1 });
    await supabase.from('internship_supervisor_state').update({
      last_check_in_at: new Date().toISOString(),
      last_interaction_at: new Date().toISOString()
    }).eq('session_id', context.session_id).eq('user_id', context.user_id);

    console.log(`✅ Check-in sent in ${Date.now() - startTime}ms`);
    return { message: 'Check-in sent', message_id: message.id, duration_ms: Date.now() - startTime };
  } catch (error) {
    console.error('Check-in error:', error);
    throw error;
  }
}

async function handleFeedbackFollowup(supabase: any, context: SupervisorContext, requestContext: any) {
  const startTime = Date.now();
  const { submission_id, feedback_data } = requestContext;

  try {
    if (!submission_id) throw new Error('submission_id required');

    const idem_key = mkIdem('feedback_followup', context.session_id, context.user_id, submission_id);

    const { data: submission } = await supabase
    .from('internship_task_submissions')
      .select('task_id, internship_tasks(title)')
    .eq('id', submission_id)
      .single();

    if (!submission) throw new Error('Submission not found');

    const taskTitle = submission.internship_tasks?.title || 'your task';
    const feedbackSummary = feedback_data?.feedback_text?.substring(0, 150) || 'Great work';

    const { data: template } = await supabase
    .from('internship_supervisor_templates')
      .select('prompt_template')
    .eq('template_type', 'feedback_followup')
    .eq('template_name', 'post_feedback_message')
    .eq('active', true)
      .limit(1)
      .single();

    const templateText = template?.prompt_template || 'Write encouragement for {user_name} after {task_title}.';
    const variables = { user_name: context.user_first_name, task_title: taskTitle, feedback_summary: feedbackSummary };

    const fallback = `Hi ${context.user_first_name},

Great job on completing "${taskTitle}"! ${feedbackSummary}

Keep up the excellent progress!

Best regards,
Sarah Mitchell`;

    const messageContent = await renderTemplateOrFallback(templateText, variables, fallback);
    const subject = generateSubject('feedback_followup');

    const { data: message, error } = await supabase
      .from('internship_supervisor_messages')
      .insert({
        session_id: context.session_id,
        user_id: context.user_id,
        message_type: 'feedback_followup',
        subject,
        message_content: messageContent,
        direction: 'outbound',
        sender_type: 'supervisor',
        context_data: { variables, submission_id, task_id: submission.task_id },
        status: 'sent',
        sent_at: new Date().toISOString(),
        idem_key
          })
          .select()
      .single();

    if (error?.code === '23505') return { message: 'Feedback already sent', skipped: true };
    if (error) throw error;

    await supabase.rpc('increment_interactions', { p_session: context.session_id, p_user: context.user_id, p_inc: 1 });

    console.log(`✅ Feedback followup sent in ${Date.now() - startTime}ms`);
    return { message: 'Feedback followup sent', message_id: message.id, duration_ms: Date.now() - startTime };
  } catch (error) {
    console.error('Feedback followup error:', error);
    throw error;
  }
}

async function handleReminder(supabase: any, context: SupervisorContext, requestContext: any) {
  const startTime = Date.now();
  const { task_id } = requestContext;

  try {
    if (!task_id) throw new Error('task_id required');

    const idem_key = mkIdem('reminder', context.session_id, context.user_id, task_id);

    const task = await getRelevantTask(supabase, context.session_id, task_id);
    if (!task) return { message: 'Task not found', skipped: true };
    if (task.status === 'completed') return { message: 'Task completed', skipped: true };

    const daysUntilDue = daysUntil(task.due_date);
    if (daysUntilDue > 1 || daysUntilDue < -1) {
      return { message: 'Not in reminder window', skipped: true };
    }

    const { data: template } = await supabase
      .from('internship_supervisor_templates')
      .select('prompt_template')
      .eq('template_type', 'reminder')
      .eq('template_name', 'deadline_reminder')
      .eq('active', true)
      .limit(1)
      .single();

    const deadlineTiming = daysUntilDue === 1 ? 'tomorrow' : daysUntilDue === 0 ? 'today' : 'soon';
    const templateText = template?.prompt_template || 'Remind {user_name} about {task_title} due {deadline_timing}.';
    const variables = { user_name: context.user_first_name, task_title: task.title, deadline_timing: deadlineTiming };

    const fallback = `Hi ${context.user_first_name},

This is a friendly reminder that "${task.title}" is due ${deadlineTiming}.

Let me know if you need any support!

Best regards,
Sarah Mitchell`;

    const messageContent = await renderTemplateOrFallback(templateText, variables, fallback);
    const subject = generateSubject('reminder', { days_until_due: daysUntilDue });

    const { data: message, error } = await supabase
          .from('internship_supervisor_messages')
          .insert({
        session_id: context.session_id,
        user_id: context.user_id,
        message_type: 'reminder',
        subject,
            message_content: messageContent,
        direction: 'outbound',
        sender_type: 'supervisor',
        context_data: { variables, task_id: task.id },
            status: 'sent',
            sent_at: new Date().toISOString(),
        idem_key
          })
          .select()
      .single();

    if (error?.code === '23505') return { message: 'Reminder already sent', skipped: true };
    if (error) throw error;

    await supabase.rpc('increment_interactions', { p_session: context.session_id, p_user: context.user_id, p_inc: 1 });

    console.log(`✅ Reminder sent in ${Date.now() - startTime}ms`);
    return { message: 'Reminder sent', message_id: message.id, duration_ms: Date.now() - startTime };
  } catch (error) {
    console.error('Reminder error:', error);
    throw error;
  }
}

/**
 * Handle user message response (auto-reply to student messages)
 */
async function handleUserMessageResponse(
  supabase: any, 
  context: SupervisorContext, 
  requestContext: any
) {
  const startTime = Date.now();
  const { 
    user_message_id, 
    user_message_content, 
    user_message_subject,
    task_id,
    thread_id 
  } = requestContext;

  try {
    if (!user_message_id || !user_message_content) {
      throw new Error('user_message_id and user_message_content required');
    }

    // Create idempotency key based on user message
    const idem_key = mkIdem('response', context.session_id, context.user_id, user_message_id);

    // Get task context if provided (with detailed information)
    let taskContext: any = null;
    if (task_id) {
      const { data: task } = await supabase
        .from('internship_tasks')
        .select(`
          id, title, description, due_date, status, instructions,
          task_details:internship_task_details(
            background,
            deliverables,
            instructions,
            success_criteria,
            resources
          )
        `)
        .eq('id', task_id)
        .single();
      
      // Flatten task details for easier access
      if (task?.task_details && task.task_details.length > 0) {
        taskContext = {
          ...task,
          ...task.task_details[0]
        };
      } else {
        taskContext = task;
      }
    }

    // Get response template
    const { data: template } = await supabase
      .from('internship_supervisor_templates')
      .select('prompt_template')
      .eq('template_type', 'user_message_response')
      .eq('template_name', 'contextual_response')
      .eq('active', true)
      .limit(1)
      .single();

    const templateText = template?.prompt_template || 
      `You are Sarah Mitchell, an internship coordinator. A student named {user_name} sent you this message: "{user_message}". 
       ${task_id ? 'They mentioned it relates to the task: "{task_title}". ' : ''}
       Provide a helpful, encouraging response with specific guidance.`;

    const variables = {
      user_name: context.user_first_name,
      user_message: user_message_content,
      user_subject: user_message_subject,
      task_title: taskContext?.title || 'N/A',
      task_description: taskContext?.description || '',
      task_background: taskContext?.background || '',
      task_deliverables: taskContext?.deliverables || '',
      task_instructions: taskContext?.instructions || '',
      task_success_criteria: taskContext?.success_criteria || '',
      task_due_date: taskContext?.due_date || '',
      days_until_due: taskContext ? daysUntil(taskContext.due_date) : null
    };

    const fallbackMessage = `Hi ${context.user_first_name},

Thank you for your message! I appreciate you reaching out.

${taskContext ? 
  `Regarding "${taskContext.title}" - this is an important task and I'm glad you're being proactive about it. ` : 
  'I\'m here to help with any questions or concerns you might have. '
}

${user_message_content.toLowerCase().includes('question') ? 
  'Great questions show you\'re thinking critically about the work. ' : 
  'Your engagement with the internship is exactly what we like to see. '
}

Feel free to ask if you need any clarification or additional guidance. I'm here to support your success!

Best regards,
Sarah Mitchell
Internship Coordinator`;

    const messageContent = await renderTemplateOrFallback(
      templateText,
      variables,
      fallbackMessage
    );

    // Generate response subject
    const responseSubject = user_message_subject && user_message_subject.startsWith('Re:') 
      ? user_message_subject 
      : `Re: ${user_message_subject || 'Your Message'}`;

    // Send response with idempotency
    const { data: message, error } = await supabase
      .from('internship_supervisor_messages')
      .insert({
        session_id: context.session_id,
        user_id: context.user_id,
        message_type: 'user_message_response',
        subject: responseSubject,
        message_content: messageContent,
        direction: 'outbound',
        sender_type: 'supervisor',
        thread_id: thread_id || user_message_id,
        context_data: { 
          variables, 
          responding_to: user_message_id,
          task_id: task_id 
        },
        status: 'sent',
        sent_at: new Date().toISOString(),
        idem_key: idem_key
      })
      .select()
      .single();

    if (error?.code === '23505') {
      return { message: 'Response already sent', skipped: true };
    }
    if (error) throw error;

    await supabase.rpc('increment_interactions', {
      p_session: context.session_id,
      p_user: context.user_id,
      p_inc: 1
    });

    console.log(`✅ User message response sent in ${Date.now() - startTime}ms`);

    return {
      message: 'Response generated and sent',
      message_id: message.id,
      duration_ms: Date.now() - startTime
    };

  } catch (error) {
    console.error('Error in user message response handler:', error);
    throw error;
  }
}

