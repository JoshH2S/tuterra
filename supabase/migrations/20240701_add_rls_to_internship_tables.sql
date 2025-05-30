-- Enable Row Level Security on all internship tables
ALTER TABLE internship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for internship_sessions
CREATE POLICY "Users can view their own internship sessions"
  ON internship_sessions
  FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own internship sessions"
  ON internship_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own internship sessions"
  ON internship_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for internship_tasks
CREATE POLICY "Users can view tasks for their internships"
  ON internship_tasks
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM internship_sessions
      WHERE id = internship_tasks.session_id
    )
  );
  
CREATE POLICY "Admin can insert tasks"
  ON internship_tasks
  FOR INSERT
  WITH CHECK (
    -- Allow service role or admin operations
    (auth.jwt() ->> 'role' = 'service_role') OR
    -- Allow the internship owner to add tasks
    (auth.uid() IN (
      SELECT user_id FROM internship_sessions
      WHERE id = internship_tasks.session_id
    ))
  );
  
CREATE POLICY "Users can update their own task status"
  ON internship_tasks
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM internship_sessions
      WHERE id = internship_tasks.session_id
    )
  );

-- Create policies for internship_messages
CREATE POLICY "Users can view messages for their internships"
  ON internship_messages
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM internship_sessions
      WHERE id = internship_messages.session_id
    )
  );
  
CREATE POLICY "Admin can insert messages"
  ON internship_messages
  FOR INSERT
  WITH CHECK (
    -- Allow service role or admin operations
    (auth.jwt() ->> 'role' = 'service_role') OR
    -- Allow the internship owner to add messages
    (auth.uid() IN (
      SELECT user_id FROM internship_sessions
      WHERE id = internship_messages.session_id
    ))
  );

-- Create policies for internship_task_submissions
CREATE POLICY "Users can view their own task submissions"
  ON internship_task_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task submissions"
  ON internship_task_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own task submissions"
  ON internship_task_submissions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for internship_events
CREATE POLICY "Users can view events for their internships"
  ON internship_events
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM internship_sessions
      WHERE id = internship_events.session_id
    )
  );

-- Create policies for internship_resources
CREATE POLICY "Users can view resources for their internships"
  ON internship_resources
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM internship_sessions
      WHERE id = internship_resources.session_id
    )
  );

-- Create policies for internship_feedback
CREATE POLICY "Users can view their own feedback"
  ON internship_feedback
  FOR SELECT
  USING (auth.uid() = user_id); 