-- Check if the table exists but doesn't have the related_task_id column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_messages'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_messages' 
    AND column_name = 'related_task_id'
  ) THEN
    -- Add the missing columns
    ALTER TABLE internship_messages 
    ADD COLUMN IF NOT EXISTS sender_name TEXT,
    ADD COLUMN IF NOT EXISTS sender_avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS body TEXT,
    ADD COLUMN IF NOT EXISTS related_task_id UUID REFERENCES internship_tasks(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
    
    -- Update existing records if needed
    UPDATE internship_messages
    SET 
      sender_name = sender,
      body = content,
      timestamp = sent_at
    WHERE 
      sender_name IS NULL AND sender IS NOT NULL;
  END IF;
END $$; 