-- ============================================================================
-- Fix message_type constraint to support two-way messaging
-- ============================================================================
-- The original constraint only allowed supervisor message types:
-- ('onboarding', 'check_in', 'feedback_followup', 'reminder', 'encouragement', 'milestone')
--
-- We need to add support for user-initiated messages and responses:
-- - 'user_message': Student-initiated questions/messages
-- - 'user_message_response': AI supervisor responses to student messages
-- ============================================================================

-- Drop the old constraint
ALTER TABLE internship_supervisor_messages 
  DROP CONSTRAINT IF EXISTS internship_supervisor_messages_message_type_check;

-- Add the updated constraint with all message types
ALTER TABLE internship_supervisor_messages
  ADD CONSTRAINT internship_supervisor_messages_message_type_check
  CHECK (message_type IN (
    -- Original supervisor message types
    'onboarding',
    'check_in', 
    'feedback_followup',
    'reminder',
    'encouragement',
    'milestone',
    -- New two-way messaging types
    'user_message',
    'user_message_response'
  ));

-- Update the comment to reflect all supported types
COMMENT ON COLUMN internship_supervisor_messages.message_type IS 
  'Message types: onboarding, check_in, feedback_followup, reminder, encouragement, milestone, user_message, user_message_response';

-- ============================================================================
-- Migration Complete
-- ============================================================================

