-- Create the internship_final_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS internship_final_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
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

-- Enable access to the new table from the Supabase client
ALTER TABLE internship_final_submissions REPLICA IDENTITY FULL;

-- Make sure the tables are accessible by the service role
GRANT ALL PRIVILEGES ON TABLE internship_final_submissions TO service_role;
GRANT ALL PRIVILEGES ON TABLE internship_sessions TO service_role;

-- Update database types to register the new table in the TypeScript types
COMMENT ON TABLE internship_final_submissions IS 'Stores user final project submissions for virtual internships';
COMMENT ON COLUMN internship_final_submissions.file_url IS 'URL to the uploaded project file';
COMMENT ON COLUMN internship_final_submissions.external_link IS 'External link to project (e.g. GitHub, Google Drive)';
COMMENT ON COLUMN internship_final_submissions.reflection IS 'User reflection on their internship experience';
COMMENT ON COLUMN internship_final_submissions.submitted_at IS 'Timestamp when the final project was submitted';
COMMENT ON COLUMN internship_sessions.is_completed IS 'Whether the internship has been completed';

-- Add trigger to update user profile with internship completion
CREATE OR REPLACE FUNCTION update_user_profile_on_internship_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment completed_internships count in user profile if available
  UPDATE profiles
  SET 
    completed_internships = COALESCE(completed_internships, 0) + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run when an internship is marked as completed
DROP TRIGGER IF EXISTS on_internship_completion ON internship_sessions;
CREATE TRIGGER on_internship_completion
  AFTER UPDATE OF is_completed
  ON internship_sessions
  FOR EACH ROW
  WHEN (OLD.is_completed = FALSE AND NEW.is_completed = TRUE)
  EXECUTE FUNCTION update_user_profile_on_internship_completion(); 