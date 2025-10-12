-- Fix team schedules table with proper defaults and constraints
-- Ensure status field has a proper default
ALTER TABLE internship_team_schedules 
ALTER COLUMN status SET DEFAULT 'pending';

-- Update any existing records with null status to 'pending'
UPDATE internship_team_schedules 
SET status = 'pending' 
WHERE status IS NULL;

-- Add constraint to ensure status is one of valid values
ALTER TABLE internship_team_schedules 
ADD CONSTRAINT check_valid_status 
CHECK (status IN ('pending', 'sent', 'cancelled', 'failed'));

-- Add constraint to ensure interaction_type is valid
ALTER TABLE internship_team_schedules 
ADD CONSTRAINT check_valid_interaction_type 
CHECK (interaction_type IN (
  'introduction', 'project_assignment', 'casual_check_in', 'meeting_invite', 
  'feedback_request', 'collaboration', 'project_update', 'casual_chat', 'meeting'
));

-- Clean up duplicate pending interactions before adding unique constraint
WITH duplicates AS (
  SELECT 
    session_id,
    user_id,
    interaction_type,
    array_agg(id ORDER BY created_at DESC) as id_list,
    array_agg(created_at ORDER BY created_at DESC) as created_at_list
  FROM internship_team_schedules
  WHERE status = 'pending'
  GROUP BY session_id, user_id, interaction_type
  HAVING COUNT(*) > 1
)
UPDATE internship_team_schedules its
SET status = 'cancelled',
    context_data = jsonb_set(
      COALESCE(context_data, '{}'::jsonb),
      '{cancelled_reason}',
      '"Duplicate interaction detected - keeping most recent"'
    )
WHERE its.id IN (
  SELECT unnest(id_list[2:]) -- Keep first (most recent) item, cancel others
  FROM duplicates
);

-- Add unique constraint to prevent duplicate pending interactions of the same type
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_team_interactions
ON internship_team_schedules (session_id, user_id, interaction_type)
WHERE status = 'pending';

-- Add index for faster queries on pending schedules
CREATE INDEX IF NOT EXISTS idx_team_schedules_pending
ON internship_team_schedules (status, scheduled_for)
WHERE status = 'pending';

-- Add index for faster cleanup of expired schedules
CREATE INDEX IF NOT EXISTS idx_team_schedules_cleanup
ON internship_team_schedules (created_at, status);

-- Log cleanup results
DO $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO cleanup_count
  FROM internship_team_schedules
  WHERE status = 'cancelled'
  AND context_data->>'cancelled_reason' = 'Duplicate interaction detected - keeping most recent';
  
  RAISE NOTICE 'Cleaned up % duplicate pending interactions', cleanup_count;
END $$; 