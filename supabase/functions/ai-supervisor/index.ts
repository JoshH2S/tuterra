import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SupervisorRequest {
  action: 'onboarding' | 'check_in' | 'feedback_followup' | 'schedule_reminder' | 'process_scheduled' | 'schedule_team_introductions' | 'schedule_team_interaction' | 'process_team_messages';
  session_id: string;
  user_id: string;
  context?: {
    task_id?: string;
    submission_id?: string;
    feedback_data?: any;
    task_progress?: any;
    custom_context?: any;
    interaction_type?: string;
    team_member?: any;
  };
}

interface SupervisorContext {
  user_name: string;
  company_name: string;
  job_title: string;
  industry: string;
  duration_weeks: number;
  tasks: any[];
  completed_tasks: number;
  current_task?: any;
  activity_streak: number;
  last_interaction?: string;
  supervisor_state: any;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📩 AI Supervisor request received:', req.method)
    
    const body = await req.text()
    console.log('📋 Raw request body:', body)
    
    if (!body || body.trim() === '') {
      console.error('❌ Empty request body')
      return new Response(JSON.stringify({
        error: 'Empty request body'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    let requestData: SupervisorRequest
    try {
      requestData = JSON.parse(body)
      console.log('✅ Parsed request data:', requestData)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { action, session_id, user_id, context = {} } = requestData

    // Enhanced parameter validation
    if (!action) {
      console.error('❌ Missing action parameter')
      return new Response(JSON.stringify({
        error: 'Missing action parameter'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!session_id || session_id === 'undefined' || session_id === 'null') {
      console.error('❌ Invalid session_id:', session_id)
      return new Response(JSON.stringify({
        error: 'Invalid session_id provided'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (!user_id || user_id === 'undefined' || user_id === 'null') {
      console.error('❌ Invalid user_id:', user_id)
      return new Response(JSON.stringify({
        error: 'Invalid user_id provided'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log(`🎯 Processing action: ${action} for session: ${session_id}, user: ${user_id}`)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get comprehensive context for this user/session
    const supervisorContext = await gatherSupervisorContext(supabaseClient, session_id, user_id)

    let result;
    switch (action) {
      case 'onboarding':
        result = await handleOnboarding(supabaseClient, supervisorContext, context)
        break
      case 'check_in':
        result = await handleCheckIn(supabaseClient, supervisorContext, context)
        break
      case 'feedback_followup':
        result = await handleFeedbackFollowup(supabaseClient, supervisorContext, context)
        break
      case 'schedule_reminder':
        result = await scheduleReminder(supabaseClient, supervisorContext, context)
        break
      case 'process_scheduled':
        result = await processScheduledMessages(supabaseClient)
        break
      case 'schedule_team_introductions':
        result = await scheduleTeamIntroductions(supabaseClient, supervisorContext, context)
        break
      case 'schedule_team_interaction':
        result = await scheduleTeamInteraction(supabaseClient, supervisorContext, context)
        break
      case 'process_team_messages':
        result = await processTeamMessages(supabaseClient)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('AI Supervisor error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function gatherSupervisorContext(supabaseClient: any, sessionId: string, userId: string): Promise<SupervisorContext> {
  try {
    // ✅ Double-check parameters before making database queries
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      throw new Error(`Invalid sessionId: ${sessionId}`)
    }
    if (!userId || userId === 'undefined' || userId === 'null') {
      throw new Error(`Invalid userId: ${userId}`)
    }

    console.log('Gathering context for session:', sessionId, 'user:', userId)

    // Get session data
    const { data: sessionData } = await supabaseClient
      .from('internship_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    // Get user data
    const { data: userData } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    // Get company data with safe handling
    const { data: companyData } = await supabaseClient
      .from('internship_company_profiles')
      .select('company_name')
      .eq('session_id', sessionId)
      .limit(1)

    // Get tasks
    const { data: tasks } = await supabaseClient
      .from('internship_tasks')
      .select('*')
      .eq('session_id', sessionId)
      .order('task_order')

    // Get submissions
    const { data: submissions } = await supabaseClient
      .from('internship_task_submissions')
      .select('task_id, created_at')
      .eq('user_id', userId)
      .eq('session_id', sessionId)

    // Get supervisor state with safe handling
    const { data: supervisorStateData } = await supabaseClient
      .from('internship_supervisor_state')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .limit(1)

    const supervisorState = supervisorStateData?.[0] || null

    const completedTasks = submissions?.length || 0
    const userName = userData ? `${userData.first_name} ${userData.last_name}` : 'there'
    const companyName = companyData?.[0]?.company_name || 'the company'

    return {
      user_name: userName,
      company_name: companyName,
      job_title: sessionData?.job_title || 'Intern',
      industry: sessionData?.industry || 'Technology',
      duration_weeks: 4, // Default
      tasks: tasks || [],
      completed_tasks: completedTasks,
      activity_streak: 5, // Mock for now
      supervisor_state: supervisorState
    }
  } catch (error) {
    console.error('Error gathering context:', error)
    throw error
  }
}

async function handleOnboarding(supabaseClient: any, context: SupervisorContext, requestContext: any) {
  // Check if onboarding already completed
  if (context.supervisor_state?.onboarding_completed) {
    return { message: 'Onboarding already completed', skipped: true }
  }

  // Get onboarding template
  const { data: template } = await supabaseClient
    .from('internship_supervisor_templates')
    .select('*')
    .eq('template_type', 'onboarding')
    .eq('template_name', 'welcome_introduction')
    .eq('active', true)
    .single()

  if (!template) {
    throw new Error('Onboarding template not found')
  }

  // Extract key task areas from tasks
  const taskAreas = context.tasks.slice(0, 3).map((task: any) => task.title).join(', ')

  // Prepare template variables
  const variables = {
    company_name: context.company_name,
    user_name: context.user_name.split(' ')[0], // First name only
    job_title: context.job_title,
    duration_weeks: context.duration_weeks,
    industry: context.industry,
    task_areas: taskAreas
  }

  // Generate message using AI
  const messageContent = await generateSupervisorMessage(template.prompt_template, variables)

  // Store the message
  const { data: message } = await supabaseClient
    .from('internship_supervisor_messages')
    .insert({
      session_id: context.supervisor_state?.session_id,
      user_id: context.supervisor_state?.user_id,
      message_type: 'onboarding',
      message_content: messageContent,
      context_data: { variables },
      scheduled_for: new Date().toISOString(),
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .select()
    .single()

  // Update supervisor state
  await supabaseClient
    .from('internship_supervisor_state')
    .upsert({
      session_id: context.supervisor_state?.session_id,
      user_id: context.supervisor_state?.user_id,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      total_interactions: (context.supervisor_state?.total_interactions || 0) + 1,
      last_interaction_at: new Date().toISOString()
    })

  // Record interaction
  await supabaseClient
    .from('internship_supervisor_interactions')
    .insert({
      session_id: context.supervisor_state?.session_id,
      user_id: context.supervisor_state?.user_id,
      interaction_type: 'message_sent',
      trigger_event: 'onboarding_trigger',
      context_snapshot: { 
        task_count: context.tasks.length,
        completed_tasks: context.completed_tasks
      },
      message_id: message.id
    })

  return { 
    message: 'Onboarding message generated and sent',
    content: messageContent,
    message_id: message.id
  }
}

async function handleCheckIn(supabaseClient: any, context: SupervisorContext, requestContext: any) {
  const { task_id } = requestContext

  // Find the specific task or use current active task
  let targetTask = null
  if (task_id) {
    targetTask = context.tasks.find((task: any) => task.id === task_id)
  } else {
    // Find next incomplete task
    targetTask = context.tasks.find((task: any) => task.status !== 'completed')
  }

  if (!targetTask) {
    return { message: 'No suitable task found for check-in', skipped: true }
  }

  // Calculate days until due
  const dueDate = new Date(targetTask.due_date)
  const now = new Date()
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Get template
  const { data: template } = await supabaseClient
    .from('internship_supervisor_templates')
    .select('*')
    .eq('template_type', 'check_in')
    .eq('template_name', 'task_progress_check')
    .eq('active', true)
    .single()

  const variables = {
    user_name: context.user_name.split(' ')[0],
    task_title: targetTask.title,
    completed_tasks: context.completed_tasks,
    total_tasks: context.tasks.length,
    due_date: dueDate.toLocaleDateString(),
    task_status: targetTask.status,
    days_until_due: daysUntilDue
  }

  const messageContent = await generateSupervisorMessage(template.prompt_template, variables)

  // Store and send message
  const { data: message } = await supabaseClient
    .from('internship_supervisor_messages')
    .insert({
      session_id: context.supervisor_state?.session_id,
      user_id: context.supervisor_state?.user_id,
      message_type: 'check_in',
      message_content: messageContent,
      context_data: { variables, task_id: targetTask.id },
      scheduled_for: new Date().toISOString(),
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .select()
    .single()

  // Update supervisor state
  await supabaseClient
    .from('internship_supervisor_state')
    .upsert({
      session_id: context.supervisor_state?.session_id,
      user_id: context.supervisor_state?.user_id,
      last_check_in_at: new Date().toISOString(),
      total_interactions: (context.supervisor_state?.total_interactions || 0) + 1,
      last_interaction_at: new Date().toISOString()
    })

  return { 
    message: 'Check-in message generated and sent',
    content: messageContent,
    message_id: message.id
  }
}

async function handleFeedbackFollowup(supabaseClient: any, context: SupervisorContext, requestContext: any) {
  const { submission_id, feedback_data } = requestContext

  // Get submission and task details
  const { data: submission } = await supabaseClient
    .from('internship_task_submissions')
    .select(`
      *,
      internship_tasks (
        id,
        title
      )
    `)
    .eq('id', submission_id)
    .single()

  if (!submission) {
    throw new Error('Submission not found')
  }

  // Get template
  const { data: template } = await supabaseClient
    .from('internship_supervisor_templates')
    .select('*')
    .eq('template_type', 'feedback_followup')
    .eq('template_name', 'post_feedback_message')
    .eq('active', true)
    .single()

  // Create feedback summary from the actual feedback
  const feedbackSummary = feedback_data?.feedback_text?.substring(0, 200) + '...' || 'Great work on this submission!'
  const overallRating = feedback_data?.quality_rating || 8

  const variables = {
    user_name: context.user_name.split(' ')[0],
    task_title: submission.internship_tasks.title,
    feedback_summary: feedbackSummary,
    overall_rating: overallRating
  }

  const messageContent = await generateSupervisorMessage(template.prompt_template, variables)

  // Store message (schedule for a few minutes after feedback)
  const scheduledFor = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes delay

  const { data: message } = await supabaseClient
    .from('internship_supervisor_messages')
    .insert({
      session_id: context.supervisor_state?.session_id,
      user_id: context.supervisor_state?.user_id,
      message_type: 'feedback_followup',
      message_content: messageContent,
      context_data: { variables, submission_id, task_id: submission.task_id },
      scheduled_for: scheduledFor.toISOString(),
      status: 'pending'
    })
    .select()
    .single()

  return { 
    message: 'Feedback followup scheduled',
    content: messageContent,
    message_id: message.id,
    scheduled_for: scheduledFor
  }
}

async function scheduleReminder(supabaseClient: any, context: SupervisorContext, requestContext: any) {
  const upcomingTasks = context.tasks.filter((task: any) => {
    const dueDate = new Date(task.due_date)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilDue <= 2 && daysUntilDue > 0 && task.status !== 'completed'
  })

  const scheduledMessages: any[] = []

  for (const task of upcomingTasks) {
    // Check if we already sent a reminder for this task
    const { data: existingReminder } = await supabaseClient
      .from('internship_supervisor_messages')
      .select('id')
      .eq('message_type', 'reminder')
      .eq('session_id', context.supervisor_state?.session_id)
      .eq('user_id', context.supervisor_state?.user_id)
      .contains('context_data', { task_id: task.id })

    if (existingReminder && existingReminder.length > 0) {
      continue // Skip if already reminded
    }

    const dueDate = new Date(task.due_date)
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    const { data: template } = await supabaseClient
      .from('internship_supervisor_templates')
      .select('*')
      .eq('template_type', 'reminder')
      .eq('template_name', 'deadline_reminder')
      .single()

    const variables = {
      user_name: context.user_name.split(' ')[0],
      task_title: task.title,
      deadline_timing: daysUntilDue === 1 ? 'tomorrow' : `in ${daysUntilDue} days`,
      days_until_due: daysUntilDue,
      task_status: task.status
    }

    const messageContent = await generateSupervisorMessage(template.prompt_template, variables)

    const { data: message } = await supabaseClient
      .from('internship_supervisor_messages')
      .insert({
        session_id: context.supervisor_state?.session_id,
        user_id: context.supervisor_state?.user_id,
        message_type: 'reminder',
        message_content: messageContent,
        context_data: { variables, task_id: task.id },
        scheduled_for: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    scheduledMessages.push(message)
  }

  return {
    message: `Scheduled ${scheduledMessages.length} reminders`,
    scheduled_messages: scheduledMessages
  }
}

async function processScheduledMessages(supabaseClient: any) {
  // Get all pending messages that should be sent now
  const { data: pendingMessages } = await supabaseClient
    .from('internship_supervisor_messages')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())

  const sentMessages: any[] = []

  for (const message of pendingMessages || []) {
    // Mark as sent
    await supabaseClient
      .from('internship_supervisor_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', message.id)

    // Update supervisor state
    await supabaseClient
      .from('internship_supervisor_state')
      .update({
        total_interactions: supabaseClient.raw('total_interactions + 1'),
        last_interaction_at: new Date().toISOString()
      })
      .eq('session_id', message.session_id)
      .eq('user_id', message.user_id)

    sentMessages.push(message)
  }

  return {
    message: `Processed ${sentMessages.length} scheduled messages`,
    sent_messages: sentMessages
  }
}

// Team Member Messaging Functions

async function scheduleTeamIntroductions(supabaseClient: any, context: SupervisorContext, requestContext: any) {
  try {
    // Get team members from company profile
    const { data: companyProfile } = await supabaseClient
      .from('internship_company_profiles')
      .select('team_members, company_name, intern_department')
      .eq('session_id', context.supervisor_state?.session_id)
      .single()

    if (!companyProfile?.team_members || !Array.isArray(companyProfile.team_members)) {
      return { message: 'No team members found in company profile', skipped: true }
    }

    const scheduledIntroductions: any[] = []

    // Schedule introduction messages from different team members
    for (let i = 0; i < Math.min(companyProfile.team_members.length, 3); i++) {
      const teamMember = companyProfile.team_members[i]
      
      // Determine message timing (stagger over first few days)
      const hoursOffset = 6 + (i * 8) + Math.random() * 4 // 6-18 hours, 14-26 hours, 22-34 hours
      const scheduledFor = new Date(Date.now() + hoursOffset * 60 * 60 * 1000)

      // Select appropriate template based on role
      const isManager = /manager|director|lead|head/i.test(teamMember.role)
      const templateType = isManager ? 'welcome_from_manager' : 'welcome_from_peer'

      const { data: template } = await supabaseClient
        .from('internship_team_message_templates')
        .select('*')
        .eq('template_name', templateType)
        .eq('active', true)
        .single()

      if (template) {
        // Schedule the team member introduction
        const { data: scheduledMessage } = await supabaseClient
          .from('internship_team_schedules')
          .insert({
            session_id: context.supervisor_state?.session_id,
            user_id: context.supervisor_state?.user_id,
            team_member_data: teamMember,
            interaction_type: 'introduction',
            scheduled_for: scheduledFor.toISOString(),
            context_data: {
              template_name: templateType,
              company_name: companyProfile.company_name,
              intern_department: companyProfile.intern_department
            }
          })
          .select()
          .single()

        scheduledIntroductions.push(scheduledMessage)
      }
    }

    return {
      message: `Scheduled ${scheduledIntroductions.length} team member introductions`,
      scheduled_introductions: scheduledIntroductions
    }
  } catch (error) {
    console.error('Error scheduling team introductions:', error)
    return { error: error.message }
  }
}

async function scheduleTeamInteraction(supabaseClient: any, context: SupervisorContext, requestContext: any) {
  try {
    const { interaction_type, team_member } = requestContext

    // Get team members from company profile if specific member not provided
    let selectedTeamMember = team_member
    if (!selectedTeamMember) {
      const { data: companyProfile } = await supabaseClient
        .from('internship_company_profiles')
        .select('team_members')
        .eq('session_id', context.supervisor_state?.session_id)
        .single()

      if (companyProfile?.team_members && Array.isArray(companyProfile.team_members)) {
        // Select a random team member
        selectedTeamMember = companyProfile.team_members[Math.floor(Math.random() * companyProfile.team_members.length)]
      }
    }

    if (!selectedTeamMember) {
      return { message: 'No team member available for interaction', skipped: true }
    }

    // Find appropriate template
    const { data: templates } = await supabaseClient
      .from('internship_team_message_templates')
      .select('*')
      .eq('template_type', interaction_type)
      .eq('active', true)

    let selectedTemplate = null
    if (templates && templates.length > 0) {
      // Match template to team member role
      selectedTemplate = templates.find((t: any) => {
        const pattern = new RegExp(t.sender_role_pattern, 'i')
        return pattern.test(selectedTeamMember.role)
      }) || templates[0] // Fallback to first template
    }

    if (!selectedTemplate) {
      return { message: `No template found for interaction type: ${interaction_type}`, skipped: true }
    }

    // Schedule the interaction
    const scheduledFor = new Date(Date.now() + Math.random() * 2 * 60 * 60 * 1000) // Random 0-2 hours

    const { data: scheduledMessage } = await supabaseClient
      .from('internship_team_schedules')
      .insert({
        session_id: context.supervisor_state?.session_id,
        user_id: context.supervisor_state?.user_id,
        team_member_data: selectedTeamMember,
        interaction_type,
        scheduled_for: scheduledFor.toISOString(),
        context_data: {
          template_name: selectedTemplate.template_name,
          template_id: selectedTemplate.id
        }
      })
      .select()
      .single()

    return {
      message: `Scheduled ${interaction_type} from ${selectedTeamMember.name}`,
      scheduled_message: scheduledMessage
    }
  } catch (error) {
    console.error('Error scheduling team interaction:', error)
    return { error: error.message }
  }
}

async function processTeamMessages(supabaseClient: any) {
  try {
    // Get all pending team member messages that should be sent now
    const { data: pendingMessages } = await supabaseClient
      .from('internship_team_schedules')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())

    const sentMessages: any[] = []

    for (const schedule of pendingMessages || []) {
      try {
        // Get the template
        const templateName = schedule.context_data?.template_name
        const { data: template } = await supabaseClient
          .from('internship_team_message_templates')
          .select('*')
          .eq('template_name', templateName)
          .single()

        if (!template) {
          console.error(`Template not found: ${templateName}`)
          continue
        }

        // Gather context for message generation
        const messageContext = await gatherTeamMessageContext(supabaseClient, schedule)
        
        // Generate the message content
        const messageContent = await generateTeamMemberMessage(template.prompt_template, messageContext)

        // Store the message with team member persona
        const { data: message } = await supabaseClient
          .from('internship_supervisor_messages')
          .insert({
            session_id: schedule.session_id,
            user_id: schedule.user_id,
            message_type: schedule.interaction_type,
            message_content: messageContent,
            context_data: schedule.context_data,
            scheduled_for: schedule.scheduled_for,
            status: 'sent',
            sent_at: new Date().toISOString(),
            sender_persona: {
              name: schedule.team_member_data.name,
              role: schedule.team_member_data.role,
              department: schedule.team_member_data.department,
              email: schedule.team_member_data.email,
              avatar_style: determineAvatarStyle(schedule.team_member_data.role)
            }
          })
          .select()
          .single()

        // Mark schedule as sent
        await supabaseClient
          .from('internship_team_schedules')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', schedule.id)

        sentMessages.push(message)

      } catch (messageError) {
        console.error('Error processing team message:', messageError)
        
        // Mark schedule as failed
        await supabaseClient
          .from('internship_team_schedules')
          .update({
            status: 'failed',
            context_data: { 
              ...schedule.context_data, 
              error: messageError.message 
            }
          })
          .eq('id', schedule.id)
      }
    }

    return {
      message: `Processed ${sentMessages.length} team member messages`,
      sent_messages: sentMessages
    }
  } catch (error) {
    console.error('Error processing team messages:', error)
    return { error: error.message }
  }
}

async function gatherTeamMessageContext(supabaseClient: any, schedule: any) {
  try {
    // Get user info
    const { data: userData } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', schedule.user_id)
      .single()

    // Get session info
    const { data: sessionData } = await supabaseClient
      .from('internship_sessions')
      .select('job_title, industry, created_at')
      .eq('id', schedule.session_id)
      .single()

    // Get company info
    const { data: companyData } = await supabaseClient
      .from('internship_company_profiles')
      .select('company_name, intern_department, sample_projects')
      .eq('session_id', schedule.session_id)
      .single()

    // Get recent tasks
    const { data: tasks } = await supabaseClient
      .from('internship_tasks')
      .select('title, status')
      .eq('session_id', schedule.session_id)
      .order('created_at', { ascending: false })
      .limit(3)

    const userName = userData ? `${userData.first_name} ${userData.last_name}` : 'there'
    const daysSinceStart = userData ? Math.floor((Date.now() - new Date(sessionData.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0

    return {
      user_name: userName.split(' ')[0], // First name only
      sender_name: schedule.team_member_data.name,
      sender_role: schedule.team_member_data.role,
      sender_department: schedule.team_member_data.department,
      company_name: companyData?.company_name || 'the company',
      job_title: sessionData?.job_title || 'intern',
      industry: sessionData?.industry || 'technology',
      intern_department: companyData?.intern_department || 'Operations',
      relevant_projects: companyData?.sample_projects?.slice(0, 2).join(', ') || 'various projects',
      current_tasks: tasks?.map((t: any) => t.title).join(', ') || 'initial orientation tasks',
      days_since_start: daysSinceStart,
      recent_activities: tasks?.filter((t: any) => t.status !== 'not_started').map((t: any) => t.title).join(', ') || 'getting oriented'
    }
  } catch (error) {
    console.error('Error gathering team message context:', error)
    // Return fallback context
    return {
      user_name: 'there',
      sender_name: schedule.team_member_data.name,
      sender_role: schedule.team_member_data.role,
      sender_department: schedule.team_member_data.department,
      company_name: 'the company',
      job_title: 'intern',
      industry: 'technology'
    }
  }
}

function determineAvatarStyle(role: string): string {
  if (/manager|director|ceo|president|vp/i.test(role)) {
    return 'executive'
  } else if (/engineer|developer|technical|architect/i.test(role)) {
    return 'technical'
  } else if (/designer|creative|marketing|brand/i.test(role)) {
    return 'creative'
  } else if (/sales|account|customer|business/i.test(role)) {
    return 'business'
  } else {
    return 'professional'
  }
}

async function generateTeamMemberMessage(template: string, variables: Record<string, any>): Promise<string> {
  try {
    // Replace template variables
    let prompt = template
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), String(value))
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are writing a workplace message as a specific team member. Keep the tone professional but personable, matching the sender\'s role and department culture. Write naturally as if you are that person.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 250,
        temperature: 0.8
      })
    })

    const result = await openAIResponse.json()
    
    if (!result.choices || !result.choices[0]) {
      throw new Error('Failed to generate message from OpenAI')
    }

    return result.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating team member message:', error)
    
    // Fallback to a basic message
    const senderName = variables.sender_name || 'Team Member'
    const userName = variables.user_name || 'there'
    
    return `Hi ${userName}! Welcome to the team. I'm ${senderName} and I'm excited to work with you during your internship. Looking forward to collaborating!

Best regards,
${senderName}`
  }
}

async function generateSupervisorMessage(template: string, variables: Record<string, any>): Promise<string> {
  try {
    // Replace template variables
    let prompt = template
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), String(value))
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    const result = await openAIResponse.json()
    
    if (!result.choices || !result.choices[0]) {
      throw new Error('Failed to generate message from OpenAI')
    }

    return result.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating AI message:', error)
    
    // Fallback to a basic message if AI fails
    const userName = variables.user_name || 'there'
    return `Hi ${userName}! I hope your internship is going well. Let me know if you need any help or have questions about your current tasks. Keep up the great work!

Best regards,
Sarah Mitchell
Internship Coordinator`
  }
} 