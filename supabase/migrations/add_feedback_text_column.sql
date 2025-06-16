-- Check if feedback_text column exists in internship_task_submissions table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_task_submissions' 
    AND column_name = 'feedback_text'
  ) THEN
    -- Add the feedback_text column
    ALTER TABLE internship_task_submissions
    ADD COLUMN feedback_text TEXT;
    
    -- Force PostgREST to refresh its schema cache
    NOTIFY pgrst, 'reload schema';
  END IF;
END $$; 