-- Add two-way messaging capability for intern-team communication

-- Stores every message sent by a team member or supervisor
CREATE TABLE IF NOT EXISTS internship_messages_v2 (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID           NOT NULL  REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id        UUID           NOT NULL  REFERENCES profiles(id) ON DELETE CASCADE, -- the intern
  sender_type    TEXT           NOT NULL  CHECK (sender_type IN ('supervisor','team','intern')),
  sender_id      UUID           NULL,     -- for team: team_member.id; for supervisor: null; for intern: user_id
  message_id     UUID           NULL,     -- FK to internship_supervisor_messages.id for threading
  content        TEXT           NOT NULL,
  subject        TEXT           NULL,
  sender_name    TEXT           NOT NULL,
  sender_role    TEXT           NULL,
  sender_department TEXT        NULL,
  sender_avatar_style TEXT      NULL,
  sent_at        TIMESTAMPTZ    NOT NULL  DEFAULT NOW(),
  status         TEXT           NOT NULL  CHECK(status IN ('sent','failed','received','read')) DEFAULT 'sent',
  context_data   JSONB          DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ    NOT NULL  DEFAULT NOW()
);

-- Captures the intern's replies to messages
CREATE TABLE IF NOT EXISTS internship_responses (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id     UUID           NOT NULL  REFERENCES internship_messages_v2(id) ON DELETE CASCADE,
  session_id     UUID           NOT NULL  REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id        UUID           NOT NULL  REFERENCES profiles(id) ON DELETE CASCADE, -- the intern
  content        TEXT           NOT NULL,
  reply_to_type  TEXT           NOT NULL  CHECK(reply_to_type IN ('supervisor','team')),
  reply_to_name  TEXT           NOT NULL, -- Name of person being replied to
  received_at    TIMESTAMPTZ    NOT NULL  DEFAULT NOW(),
  processed      BOOLEAN        NOT NULL  DEFAULT FALSE,
  processing_status TEXT        DEFAULT 'pending' CHECK(processing_status IN ('pending','processed','failed','escalated')),
  auto_response_generated BOOLEAN DEFAULT FALSE,
  escalation_reason TEXT        NULL,
  created_at     TIMESTAMPTZ    NOT NULL  DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internship_messages_v2_session 
ON internship_messages_v2(session_id, user_id);

CREATE INDEX IF NOT EXISTS idx_internship_messages_v2_status 
ON internship_messages_v2(status, sent_at);

CREATE INDEX IF NOT EXISTS idx_internship_messages_v2_thread 
ON internship_messages_v2(message_id, sent_at);

CREATE INDEX IF NOT EXISTS idx_internship_responses_session 
ON internship_responses(session_id, user_id);

CREATE INDEX IF NOT EXISTS idx_internship_responses_processing 
ON internship_responses(processed, processing_status, received_at);

CREATE INDEX IF NOT EXISTS idx_internship_responses_message 
ON internship_responses(message_id, received_at);

-- RLS Policies
ALTER TABLE internship_messages_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_responses ENABLE ROW LEVEL SECURITY;

-- Interns can only see their own messages and responses
CREATE POLICY "Interns can view own messages" ON internship_messages_v2
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Interns can insert own messages" ON internship_messages_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id AND sender_type = 'intern');

CREATE POLICY "Service role can manage all messages" ON internship_messages_v2
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Interns can view own responses" ON internship_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Interns can insert own responses" ON internship_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all responses" ON internship_responses
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to migrate existing supervisor messages to new structure
CREATE OR REPLACE FUNCTION migrate_supervisor_messages_to_v2()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
BEGIN
  INSERT INTO internship_messages_v2 (
    session_id,
    user_id,
    sender_type,
    sender_id,
    message_id,
    content,
    subject,
    sender_name,
    sender_role,
    sender_department,
    sender_avatar_style,
    sent_at,
    status,
    context_data
  )
  SELECT 
    ism.session_id,
    ism.user_id,
    CASE 
      WHEN ism.sender_persona->>'name' = 'Sarah Mitchell' THEN 'supervisor'
      ELSE 'team'
    END as sender_type,
    NULL as sender_id, -- We don't have team member IDs in the old structure
    ism.id as message_id,
    ism.message_content as content,
    'Message from ' || COALESCE(ism.sender_persona->>'name', 'Sarah Mitchell') as subject,
    COALESCE(ism.sender_persona->>'name', 'Sarah Mitchell') as sender_name,
    COALESCE(ism.sender_persona->>'role', 'Internship Coordinator') as sender_role,
    COALESCE(ism.sender_persona->>'department', 'Human Resources') as sender_department,
    COALESCE(ism.sender_persona->>'avatar_style', 'professional') as sender_avatar_style,
    COALESCE(ism.sent_at, ism.scheduled_for, ism.created_at) as sent_at,
    'sent' as status,
    ism.context_data
  FROM internship_supervisor_messages ism
  WHERE ism.status = 'sent'
  AND NOT EXISTS (
    SELECT 1 FROM internship_messages_v2 im2 
    WHERE im2.message_id = ism.id
  );

  GET DIAGNOSTICS migrated_count = ROW_COUNT;
  
  RAISE NOTICE 'Migrated % supervisor messages to v2 table', migrated_count;
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically add new supervisor messages to v2 table
CREATE OR REPLACE FUNCTION sync_supervisor_messages_to_v2()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' THEN
    INSERT INTO internship_messages_v2 (
      session_id,
      user_id,
      sender_type,
      message_id,
      content,
      subject,
      sender_name,
      sender_role,
      sender_department,
      sender_avatar_style,
      sent_at,
      status,
      context_data
    ) VALUES (
      NEW.session_id,
      NEW.user_id,
      CASE 
        WHEN NEW.sender_persona->>'name' = 'Sarah Mitchell' THEN 'supervisor'
        ELSE 'team'
      END,
      NEW.id,
      NEW.message_content,
      'Message from ' || COALESCE(NEW.sender_persona->>'name', 'Sarah Mitchell'),
      COALESCE(NEW.sender_persona->>'name', 'Sarah Mitchell'),
      COALESCE(NEW.sender_persona->>'role', 'Internship Coordinator'),
      COALESCE(NEW.sender_persona->>'department', 'Human Resources'),
      COALESCE(NEW.sender_persona->>'avatar_style', 'professional'),
      COALESCE(NEW.sent_at, NEW.scheduled_for, NOW()),
      'sent',
      NEW.context_data
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_supervisor_messages
  AFTER INSERT OR UPDATE ON internship_supervisor_messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_supervisor_messages_to_v2(); 