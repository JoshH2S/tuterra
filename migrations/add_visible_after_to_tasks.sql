-- Add visible_after field to internship_tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_tasks' 
    AND column_name = 'visible_after'
  ) THEN
    ALTER TABLE internship_tasks ADD COLUMN visible_after TIMESTAMP WITH TIME ZONE;
    
    -- Set default visible_after based on task order and created_at date
    -- First two tasks visible from the start
    -- Every 2 tasks after that, add 1 week to created_at
    UPDATE internship_tasks t
    SET visible_after = (
      SELECT 
        CASE 
          WHEN t.task_order <= 2 THEN sessions.created_at
          ELSE (sessions.created_at::TIMESTAMP + ((FLOOR((t.task_order - 1) / 2) * INTERVAL '1 week')))
        END
      FROM internship_sessions sessions
      WHERE sessions.id = t.session_id
    );
    
    -- Add comment to document the field
    COMMENT ON COLUMN internship_tasks.visible_after IS 'The date after which this task becomes visible to the user';
  END IF;
END $$; 