-- ============================================================================
-- Auto-Response System: Student Message Responses
-- ============================================================================
-- Adds ability for Sarah to automatically respond to student messages
-- with context-aware, task-specific guidance
-- ============================================================================

-- Add response template for student messages
INSERT INTO internship_supervisor_templates (
  template_type,
  template_name,
  prompt_template,
  variables,
  active,
  version
) VALUES (
  'user_message_response',
  'contextual_response',
  'You are Sarah Mitchell, a professional and supportive internship coordinator at a company. 

A student named {user_name} sent you this message with the subject "{user_subject}":
"{user_message}"

${task_title !== ''N/A'' ? ''
Context about related task:
- Task Name: {task_title}
- Task Description: {task_description}
- Days until due: {days_until_due} days
'' : ''This is a general question not related to a specific task.''}

Provide a helpful, encouraging response that:
1. Acknowledges their message warmly and professionally
2. Addresses their specific question or concern directly
3. ${task_title !== ''N/A'' ? ''Provides actionable, task-specific guidance'' : ''Provides general support and guidance''}
4. Encourages them to continue asking questions
5. Maintains a supportive, mentor-like tone

Important guidelines:
- Keep response to 100-150 words
- Be specific and actionable
- Reference the task context if provided
- Show you understand their concern
- End with encouragement or next steps

Write only the message body, no subject line.',
  '["user_name", "user_message", "user_subject", "task_title", "task_description", "days_until_due"]'::jsonb,
  true,
  '1.0'
)
ON CONFLICT (template_type, template_name, version) 
DO UPDATE SET
  prompt_template = EXCLUDED.prompt_template,
  variables = EXCLUDED.variables,
  active = EXCLUDED.active;

-- Add message_type for user responses
-- (This is informational - the check constraint allows any text value)
COMMENT ON COLUMN internship_supervisor_messages.message_type IS 
  'Message types: onboarding, check_in, feedback_followup, reminder, user_message_response, user_message';

-- Verify template was created
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM internship_supervisor_templates 
    WHERE template_type = 'user_message_response' 
    AND template_name = 'contextual_response'
  ) THEN
    RAISE EXCEPTION 'Auto-response migration failed: template not created';
  END IF;

  RAISE NOTICE '✅ Auto-response template created successfully';
  RAISE NOTICE '✅ Sarah can now respond to student messages with task context';
END $$;
