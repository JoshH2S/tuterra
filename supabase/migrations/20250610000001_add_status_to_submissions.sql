-- Add status field to internship_task_submissions table
ALTER TABLE internship_task_submissions
ADD COLUMN status TEXT CHECK (status IN ('submitted', 'feedback_pending', 'reviewed', 'completed')) DEFAULT 'submitted';

-- Update any existing submissions to have a default status
UPDATE internship_task_submissions
SET status = 'submitted'
WHERE status IS NULL;

-- Update schema cache
NOTIFY pgrst, 'reload schema'; 