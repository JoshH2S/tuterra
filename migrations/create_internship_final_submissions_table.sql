-- Create the internship_final_submissions table
CREATE TABLE IF NOT EXISTS internship_final_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  file_url TEXT,
  external_link TEXT,
  reflection TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id)
);

-- Add is_completed field to internship_sessions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_sessions' 
    AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE internship_sessions ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_final_submissions_session_id ON internship_final_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_final_submissions_user_id ON internship_final_submissions(user_id);

-- Add RLS policies
ALTER TABLE internship_final_submissions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own final submissions
CREATE POLICY "Users can view their own final submissions" 
  ON internship_final_submissions
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow users to insert their own final submissions
CREATE POLICY "Users can insert their own final submissions" 
  ON internship_final_submissions
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own final submissions
CREATE POLICY "Users can update their own final submissions" 
  ON internship_final_submissions
  FOR UPDATE 
  USING (user_id = auth.uid()); 