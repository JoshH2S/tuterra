-- Create the internship_messages table
CREATE TABLE IF NOT EXISTS internship_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar_url TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  related_task_id UUID REFERENCES internship_tasks(id) ON DELETE SET NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_internship_messages_session_id ON internship_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_internship_messages_related_task_id ON internship_messages(related_task_id);
CREATE INDEX IF NOT EXISTS idx_internship_messages_timestamp ON internship_messages(timestamp);

-- Add RLS policies
ALTER TABLE internship_messages ENABLE ROW LEVEL SECURITY;

-- Allow users to view messages in their own internship sessions
CREATE POLICY "Users can view their internship messages"
  ON internship_messages
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM internship_sessions WHERE user_id = auth.uid()
    )
  );

-- Allow users to mark messages as read
CREATE POLICY "Users can update read status of their messages"
  ON internship_messages
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM internship_sessions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM internship_sessions WHERE user_id = auth.uid()
    )
  ); 