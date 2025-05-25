-- Create the internship_task_submissions table
CREATE TABLE IF NOT EXISTS internship_task_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES internship_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  response_text TEXT NOT NULL,
  feedback_text TEXT,
  quality_rating INTEGER CHECK (quality_rating >= 0 AND quality_rating <= 10),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 0 AND timeliness_rating <= 10),
  collaboration_rating INTEGER CHECK (collaboration_rating >= 0 AND collaboration_rating <= 10),
  overall_assessment TEXT,
  feedback_provided_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- Add policies for RLS
ALTER TABLE internship_task_submissions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON internship_task_submissions
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to insert their own submissions
CREATE POLICY "Users can insert their own submissions"
  ON internship_task_submissions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own submissions before feedback is provided
CREATE POLICY "Users can update their own submissions if no feedback"
  ON internship_task_submissions
  FOR UPDATE
  USING (user_id = auth.uid() AND feedback_text IS NULL);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_task_submissions_task_id ON internship_task_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_session_id ON internship_task_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_user_id ON internship_task_submissions(user_id); 