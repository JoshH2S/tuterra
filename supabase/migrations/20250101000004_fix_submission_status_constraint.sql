-- Fix the status check constraint to include 'feedback_received'
-- This status is used when feedback has been generated and provided to the user

-- Drop the existing constraint
ALTER TABLE internship_task_submissions 
DROP CONSTRAINT IF EXISTS internship_task_submissions_status_check;

-- Add the updated constraint with 'feedback_received' included
ALTER TABLE internship_task_submissions
ADD CONSTRAINT internship_task_submissions_status_check 
CHECK (status IN ('submitted', 'feedback_pending', 'reviewed', 'completed', 'feedback_received'));

-- Update schema cache
NOTIFY pgrst, 'reload schema';

