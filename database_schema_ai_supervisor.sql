-- AI Supervisor Database Schema Extensions

-- Table to track supervisor state and interactions for each session
CREATE TABLE internship_supervisor_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Interaction tracking
  last_check_in_at TIMESTAMP WITH TIME ZONE,
  total_interactions INTEGER DEFAULT 0,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress awareness
  last_known_task_count INTEGER DEFAULT 0,
  last_known_completed_tasks INTEGER DEFAULT 0,
  overdue_tasks_notified JSONB DEFAULT '[]'::jsonb,
  
  -- Engagement metrics
  activity_streak_last_checked INTEGER DEFAULT 0,
  missed_deadlines_count INTEGER DEFAULT 0,
  
  -- Supervisor personality/context
  supervisor_name TEXT DEFAULT 'Sarah Mitchell',
  supervisor_role TEXT DEFAULT 'Internship Coordinator',
  communication_style JSONB DEFAULT '{"tone": "friendly", "formality": "professional-casual"}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for scheduled supervisor messages and check-ins
CREATE TABLE internship_supervisor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message details
  message_type TEXT NOT NULL CHECK (message_type IN ('onboarding', 'check_in', 'feedback_followup', 'reminder', 'encouragement', 'milestone')),
  message_content TEXT NOT NULL,
  context_data JSONB DEFAULT '{}'::jsonb, -- Store context like task_id, submission_id, etc.
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  
  -- Message generation metadata
  generated_by TEXT DEFAULT 'ai_supervisor',
  prompt_version TEXT DEFAULT 'v1.0',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for supervisor interaction history (for memory/context)
CREATE TABLE internship_supervisor_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Interaction details
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('message_sent', 'task_progress_check', 'feedback_generated', 'deadline_reminder', 'achievement_earned')),
  trigger_event TEXT, -- What triggered this interaction
  context_snapshot JSONB DEFAULT '{}'::jsonb, -- Snapshot of relevant state at time of interaction
  
  -- Message reference (if applicable)
  message_id UUID REFERENCES internship_supervisor_messages(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for supervisor message templates and prompts
CREATE TABLE internship_supervisor_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- List of variable names used in template
  active BOOLEAN DEFAULT TRUE,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(template_type, template_name, version)
);

-- Indexes for performance
CREATE INDEX idx_supervisor_state_session ON internship_supervisor_state(session_id);
CREATE INDEX idx_supervisor_state_user ON internship_supervisor_state(user_id);
CREATE INDEX idx_supervisor_messages_session ON internship_supervisor_messages(session_id);
CREATE INDEX idx_supervisor_messages_scheduled ON internship_supervisor_messages(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_supervisor_interactions_session ON internship_supervisor_interactions(session_id);
CREATE INDEX idx_supervisor_interactions_type ON internship_supervisor_interactions(interaction_type);

-- RLS Policies
ALTER TABLE internship_supervisor_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_supervisor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_supervisor_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_supervisor_templates ENABLE ROW LEVEL SECURITY;

-- Users can only access their own supervisor data
CREATE POLICY "Users can access own supervisor state" ON internship_supervisor_state
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own supervisor messages" ON internship_supervisor_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own supervisor interactions" ON internship_supervisor_interactions
  FOR ALL USING (auth.uid() = user_id);

-- Templates are readable by all authenticated users
CREATE POLICY "Templates are readable by authenticated users" ON internship_supervisor_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default supervisor templates
INSERT INTO internship_supervisor_templates (template_type, template_name, prompt_template, variables) VALUES
('onboarding', 'welcome_introduction', 
'You are Sarah Mitchell, an experienced internship coordinator at {company_name}. Write a warm, professional welcome message to {user_name} who is starting their {job_title} internship. Include:
- Brief introduction of yourself and your role
- Overview of what they can expect during their {duration_weeks}-week internship
- Mention 2-3 key tasks they''ll be working on
- Set a friendly but professional tone
- Keep it conversational, like a Slack message from a manager
- End with encouragement and offer to help

Context: Company is in {industry} industry. User will be working on tasks related to {task_areas}.', 
'["company_name", "user_name", "job_title", "duration_weeks", "industry", "task_areas"]'),

('check_in', 'task_progress_check',
'You are Sarah Mitchell, checking in on {user_name}''s progress. Write a brief, friendly check-in message about their work on "{task_title}". 
- Keep it casual but professional (like a Slack message)
- Show awareness of their progress ({completed_tasks}/{total_tasks} tasks completed)
- Mention the upcoming deadline if relevant: {due_date}
- Offer help if they seem behind
- Use encouraging tone
- Keep it under 100 words

Current context: Task status is {task_status}, {days_until_due} days until deadline.',
'["user_name", "task_title", "completed_tasks", "total_tasks", "due_date", "task_status", "days_until_due"]'),

('feedback_followup', 'post_feedback_message',
'You are Sarah Mitchell following up after {user_name} received AI feedback on their "{task_title}" submission. Write a supportive follow-up message that:
- Acknowledges their submission
- Highlights 1-2 positive aspects from the feedback
- Offers guidance on areas for improvement if mentioned in feedback
- Maintains encouraging tone
- Feels like a manager reviewing their work
- Keep it conversational and under 150 words

Feedback summary: {feedback_summary}
Overall rating: {overall_rating}/10',
'["user_name", "task_title", "feedback_summary", "overall_rating"]'),

('reminder', 'deadline_reminder',
'You are Sarah Mitchell sending a friendly reminder to {user_name}. Write a gentle reminder about "{task_title}" which is due {deadline_timing}. 
- Keep it brief and helpful
- Don''t be pushy, but show awareness of timeline
- Offer support if needed
- Match the urgency to timeline (casual if early, more urgent if last minute)
- Feel like a manager keeping track of deadlines

Context: {days_until_due} days until due, task status: {task_status}',
'["user_name", "task_title", "deadline_timing", "days_until_due", "task_status"]'),

('encouragement', 'milestone_celebration',
'You are Sarah Mitchell celebrating {user_name}''s achievement. Write an encouraging message about their progress:
- Celebrate specific milestone: {milestone_type}
- Mention their completion rate: {completion_percentage}%
- Keep it genuine and professional
- Show you''re paying attention to their work
- Brief but meaningful recognition

Achievement context: {achievement_details}',
'["user_name", "milestone_type", "completion_percentage", "achievement_details"]'); 