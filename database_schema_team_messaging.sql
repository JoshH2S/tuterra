-- Team Member Messaging Enhancement for AI Supervisor System
-- This extends the existing AI Supervisor infrastructure to support realistic team member communication

-- Extend internship_supervisor_messages to support multiple team member personas
ALTER TABLE internship_supervisor_messages 
ADD COLUMN IF NOT EXISTS sender_persona JSONB DEFAULT '{"name": "Sarah Mitchell", "role": "Internship Coordinator", "department": "Human Resources", "avatar_style": "professional"}';

-- Create team member message templates table
CREATE TABLE IF NOT EXISTS internship_team_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'introduction', 'project_assignment', 'casual_check_in', 'meeting_invite', 'feedback_request', 'collaboration'
  sender_role_pattern VARCHAR(100) NOT NULL, -- 'Marketing.*', 'Engineering.*', 'Manager', etc.
  department VARCHAR(50), -- Marketing, Engineering, Sales, HR, etc.
  prompt_template TEXT NOT NULL,
  context_requirements JSONB, -- What context this template needs
  timing_rules JSONB, -- When this message type should be sent
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team member interaction schedules
CREATE TABLE IF NOT EXISTS internship_team_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_member_data JSONB NOT NULL, -- Full team member object from company profile
  interaction_type VARCHAR(50) NOT NULL, -- 'introduction', 'project_update', 'casual_chat', 'meeting'
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  context_data JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create user reply tracking (for optional interaction feature)
CREATE TABLE IF NOT EXISTS internship_user_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  original_message_id UUID NOT NULL REFERENCES internship_supervisor_messages(id) ON DELETE CASCADE,
  reply_content TEXT NOT NULL,
  reply_type VARCHAR(50) DEFAULT 'text', -- 'text', 'emoji_reaction', 'quick_response'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add response metadata
  response_sentiment VARCHAR(20), -- 'positive', 'neutral', 'confused', 'excited'
  triggered_followup BOOLEAN DEFAULT false
);

-- Insert default team member message templates
INSERT INTO internship_team_message_templates (template_name, template_type, sender_role_pattern, department, prompt_template, context_requirements, timing_rules) VALUES

-- Introduction messages from various team members
('welcome_from_manager', 'introduction', '.*Manager.*|.*Director.*|.*Lead.*', 'any', 
'You are {sender_name}, a {sender_role} in the {sender_department} department. Write a professional but warm welcome message to a new virtual intern named {user_name} who will be working as a {job_title} in the {industry} industry. 

Context: The intern is joining {company_name} and will be working on {relevant_projects}.

Write a message that:
- Welcomes them warmly to the team
- Briefly introduces your role and how you might work together  
- Mentions 1-2 specific areas where you could provide guidance
- Sets a collaborative and supportive tone
- Keep it professional but friendly (2-3 sentences)

Sign it as {sender_name}, {sender_role}',
'{"user_name": "required", "sender_name": "required", "sender_role": "required", "sender_department": "required", "company_name": "required", "job_title": "required", "industry": "required", "relevant_projects": "optional"}',
'{"min_hours_after_onboarding": 4, "max_hours_after_onboarding": 24, "probability": 0.8}'),

('welcome_from_peer', 'introduction', '.*Analyst.*|.*Specialist.*|.*Coordinator.*|.*Associate.*', 'any',
'You are {sender_name}, a {sender_role} in the {sender_department} department. Write a friendly, peer-to-peer welcome message to a new virtual intern named {user_name} who will be working as a {job_title}.

Context: You work at {company_name} and have been there for a while. The intern is new and you want to be helpful and welcoming.

Write a message that:
- Welcomes them as a peer/colleague
- Shares a brief personal note about the company culture or your experience
- Offers to help with questions or show them the ropes
- Maybe mentions a tool, process, or resource that might be helpful
- Keep it casual but professional (2-3 sentences)

Sign it as {sender_name}',
'{"user_name": "required", "sender_name": "required", "sender_role": "required", "sender_department": "required", "company_name": "required", "job_title": "required"}',
'{"min_hours_after_onboarding": 8, "max_hours_after_onboarding": 48, "probability": 0.6}'),

-- Project-related messages
('project_assignment', 'project_assignment', '.*Manager.*|.*Lead.*|.*Director.*', 'any',
'You are {sender_name}, a {sender_role} in the {sender_department} department. Write a message to intern {user_name} about a new project assignment or task.

Context: The intern has been working on: {current_tasks}. Company: {company_name}

Write a message that:
- References their current work positively
- Introduces a new project or expanded responsibility
- Explains why this is valuable for their learning
- Sets clear but encouraging expectations
- Keep it motivating and clear (3-4 sentences)

Sign it as {sender_name}',
'{"user_name": "required", "sender_name": "required", "sender_role": "required", "sender_department": "required", "company_name": "required", "current_tasks": "required"}',
'{"trigger_on_task_completion": true, "min_completed_tasks": 2, "probability": 0.7}'),

-- Casual check-ins
('casual_check_in', 'casual_check_in', '.*', 'any',
'You are {sender_name}, a {sender_role} at {company_name}. Write a brief, casual check-in message to intern {user_name}.

Context: They have been working for {days_since_start} days and recently worked on: {recent_activities}

Write a message that:
- Checks in on how things are going
- Shows genuine interest in their experience
- Maybe asks about a specific project or offers help
- Keeps the tone supportive and conversational
- Keep it brief and friendly (2-3 sentences)

Sign it as {sender_name}',
'{"user_name": "required", "sender_name": "required", "sender_role": "required", "company_name": "required", "days_since_start": "required", "recent_activities": "optional"}',
'{"min_days_since_last_contact": 3, "max_days_since_last_contact": 7, "probability": 0.4}'),

-- Cross-department collaboration
('collaboration_invite', 'collaboration', '.*', 'different_from_intern',
'You are {sender_name}, a {sender_role} in the {sender_department} department. Write a message to intern {user_name} (who works in {intern_department}) about a potential collaboration opportunity.

Context: Company: {company_name}, your department works on: {department_focus}

Write a message that:
- Introduces the collaboration opportunity
- Explains how their {intern_department} perspective would be valuable
- Shows enthusiasm for cross-functional work
- Suggests a next step (meeting, call, or shared project)
- Keep it collaborative and exciting (3-4 sentences)

Sign it as {sender_name}, {sender_department}',
'{"user_name": "required", "sender_name": "required", "sender_role": "required", "sender_department": "required", "intern_department": "required", "company_name": "required", "department_focus": "optional"}',
'{"min_completed_tasks": 3, "probability": 0.3, "cross_department_only": true}'),

-- Meeting invitations
('meeting_invite', 'meeting_invite', '.*Manager.*|.*Director.*|.*Lead.*', 'any',
'You are {sender_name}, a {sender_role}. Write a message inviting intern {user_name} to a team meeting or one-on-one session.

Context: Company: {company_name}, meeting purpose: {meeting_context}

Write a message that:
- Invites them to a specific type of meeting (team standup, review session, brainstorming, etc.)
- Explains the value/purpose for them
- Gives them a sense of what to expect
- Makes them feel included and valued
- Keep it professional but welcoming (2-3 sentences)

Sign it as {sender_name}',
'{"user_name": "required", "sender_name": "required", "sender_role": "required", "company_name": "required", "meeting_context": "optional"}',
'{"min_completed_tasks": 1, "probability": 0.5, "timing": "weekly"}');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_schedules_session_user ON internship_team_schedules(session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_team_schedules_scheduled_for ON internship_team_schedules(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_team_schedules_status ON internship_team_schedules(status);
CREATE INDEX IF NOT EXISTS idx_user_replies_original_message ON internship_user_replies(original_message_id);
CREATE INDEX IF NOT EXISTS idx_team_templates_type_role ON internship_team_message_templates(template_type, sender_role_pattern);

-- Add comments for documentation
COMMENT ON TABLE internship_team_message_templates IS 'Message templates for different team member personas and interaction types';
COMMENT ON TABLE internship_team_schedules IS 'Scheduled interactions from various team members to create realistic workplace communication';
COMMENT ON TABLE internship_user_replies IS 'User responses to team member messages for interactive communication';

COMMENT ON COLUMN internship_supervisor_messages.sender_persona IS 'JSON object containing sender details: name, role, department, avatar_style';
COMMENT ON COLUMN internship_team_message_templates.sender_role_pattern IS 'Regex pattern to match against team member roles for template selection';
COMMENT ON COLUMN internship_team_schedules.team_member_data IS 'Full team member object from company profile (name, role, email, department)';
COMMENT ON COLUMN internship_user_replies.response_sentiment IS 'Detected sentiment from user reply for contextual follow-ups'; 