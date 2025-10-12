-- ============================================================================
-- Supervisor MVP: Idempotency-based Messaging System
-- ============================================================================
-- This migration transforms the supervisor messaging system from lock-based
-- to idempotency-key-based for reliable, deterministic message delivery.
--
-- Key Changes:
-- 1. Add idempotency key for duplicate prevention
-- 2. Add email-style fields (subject, direction, sender_type)
-- 3. Add read tracking and threading support
-- 4. Create RPC for safe interaction increments
-- 5. Add comprehensive RLS policies
-- ============================================================================

-- ============================================================================
-- PART 1: Schema Extensions (Additive - Safe)
-- ============================================================================

-- Add new columns to internship_supervisor_messages
ALTER TABLE internship_supervisor_messages
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'outbound'
    CHECK (direction IN ('outbound', 'inbound')),
  ADD COLUMN IF NOT EXISTS sender_type TEXT NOT NULL DEFAULT 'supervisor'
    CHECK (sender_type IN ('supervisor', 'user', 'system')),
  ADD COLUMN IF NOT EXISTS thread_id UUID,
  ADD COLUMN IF NOT EXISTS idem_key TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;

-- Add unique constraint for idempotency (partial index for non-null keys)
CREATE UNIQUE INDEX IF NOT EXISTS idx_supervisor_messages_idem_key 
  ON internship_supervisor_messages(idem_key) 
  WHERE idem_key IS NOT NULL;

-- Update existing messages to have default values for new columns
UPDATE internship_supervisor_messages
SET 
  direction = 'outbound',
  sender_type = 'supervisor',
  is_read = CASE WHEN sent_at IS NOT NULL THEN TRUE ELSE FALSE END
WHERE direction IS NULL;

-- ============================================================================
-- PART 2: Performance Indexes
-- ============================================================================

-- Index for inbox queries (session + direction + created_at)
CREATE INDEX IF NOT EXISTS idx_ism_inbox_query 
  ON internship_supervisor_messages(session_id, direction, created_at DESC)
  WHERE status = 'sent';

-- Index for unread message counts
CREATE INDEX IF NOT EXISTS idx_ism_unread 
  ON internship_supervisor_messages(user_id, is_read)
  WHERE status = 'sent' AND direction = 'outbound';

-- Index for thread queries
CREATE INDEX IF NOT EXISTS idx_ism_thread 
  ON internship_supervisor_messages(thread_id, created_at)
  WHERE thread_id IS NOT NULL;

-- Existing indexes (ensure they exist)
CREATE INDEX IF NOT EXISTS idx_ism_session_created
  ON internship_supervisor_messages(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ism_user_created
  ON internship_supervisor_messages(user_id, created_at DESC);

-- ============================================================================
-- PART 3: State Table Improvements
-- ============================================================================

-- Ensure state table has primary key on (session_id, user_id)
-- First, check if we need to modify the existing table
DO $$ 
BEGIN
  -- Add composite primary key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'internship_supervisor_state_pkey'
  ) THEN
    -- If table has an id column as PK, we need to drop it and create composite
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'internship_supervisor_state' 
      AND column_name = 'id'
    ) THEN
      -- Remove old PK if exists
      ALTER TABLE internship_supervisor_state DROP CONSTRAINT IF EXISTS internship_supervisor_state_pkey;
      -- Add composite PK
      ALTER TABLE internship_supervisor_state 
        ADD PRIMARY KEY (session_id, user_id);
    END IF;
  END IF;
END $$;

-- Add onboarding_completed_at if it doesn't exist
ALTER TABLE internship_supervisor_state
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- ============================================================================
-- PART 4: RPC Functions
-- ============================================================================

-- Safe interaction increment function (replaces raw SQL updates)
CREATE OR REPLACE FUNCTION increment_interactions(
  p_session UUID,
  p_user UUID,
  p_inc INT
) RETURNS VOID 
LANGUAGE SQL 
SECURITY DEFINER
AS $$
  INSERT INTO internship_supervisor_state (session_id, user_id, total_interactions, last_interaction_at)
  VALUES (p_session, p_user, p_inc, NOW())
  ON CONFLICT (session_id, user_id) 
  DO UPDATE SET
    total_interactions = COALESCE(internship_supervisor_state.total_interactions, 0) + p_inc,
    last_interaction_at = NOW();
$$;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(
  p_session UUID,
  p_user UUID
) RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM internship_supervisor_messages
  WHERE session_id = p_session
    AND user_id = p_user
    AND direction = 'outbound'
    AND status = 'sent'
    AND is_read = FALSE;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_message_ids UUID[]
) RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE internship_supervisor_messages
  SET is_read = TRUE
  WHERE id = ANY(p_message_ids)
    AND is_read = FALSE
  RETURNING 1;
  
  SELECT COUNT(*)::INTEGER FROM (
    SELECT 1 FROM internship_supervisor_messages
    WHERE id = ANY(p_message_ids)
  ) AS updated;
$$;

-- ============================================================================
-- PART 5: RLS Policies (Security)
-- ============================================================================

-- Enable RLS on tables (idempotent)
ALTER TABLE internship_supervisor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_supervisor_state ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate with correct logic)
DROP POLICY IF EXISTS "Users can access own supervisor state" ON internship_supervisor_state;
DROP POLICY IF EXISTS "Users can access own supervisor messages" ON internship_supervisor_messages;
DROP POLICY IF EXISTS "student_can_read_own_session_messages" ON internship_supervisor_messages;
DROP POLICY IF EXISTS "student_can_read_own_state" ON internship_supervisor_state;
DROP POLICY IF EXISTS "service_role_can_write_messages" ON internship_supervisor_messages;
DROP POLICY IF EXISTS "service_role_can_write_state" ON internship_supervisor_state;

-- Messages: Students can read their own session messages
CREATE POLICY "student_can_read_own_session_messages"
ON internship_supervisor_messages
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM internship_sessions WHERE user_id = auth.uid()
  )
);

-- Messages: Students can insert their own messages (for replies)
CREATE POLICY "student_can_insert_own_messages"
ON internship_supervisor_messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  direction = 'inbound' AND
  sender_type = 'user' AND
  session_id IN (
    SELECT id FROM internship_sessions WHERE user_id = auth.uid()
  )
);

-- Messages: Students can update read status on their own messages
CREATE POLICY "student_can_update_read_status"
ON internship_supervisor_messages
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

-- Messages: Service role can do everything (for Edge Functions)
CREATE POLICY "service_role_full_access_messages"
ON internship_supervisor_messages
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- State: Students can read their own state
CREATE POLICY "student_can_read_own_state"
ON internship_supervisor_state
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM internship_sessions WHERE user_id = auth.uid()
  )
);

-- State: Service role can do everything
CREATE POLICY "service_role_full_access_state"
ON internship_supervisor_state
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 6: Helper Views (Optional - for easier querying)
-- ============================================================================

-- View for inbox messages (outbound + inbound combined)
CREATE OR REPLACE VIEW internship_inbox_messages AS
SELECT 
  id,
  session_id,
  user_id,
  message_type,
  subject,
  message_content,
  direction,
  sender_type,
  sender_persona,
  thread_id,
  is_read,
  sent_at,
  created_at,
  context_data,
  meta
FROM internship_supervisor_messages
WHERE status = 'sent'
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON internship_inbox_messages TO authenticated;
GRANT SELECT ON internship_inbox_messages TO service_role;

-- ============================================================================
-- PART 7: Data Quality - Set Subjects for Existing Messages
-- ============================================================================

-- Generate subjects for existing messages that don't have one
UPDATE internship_supervisor_messages
SET subject = CASE message_type
  WHEN 'onboarding' THEN '🌟 Welcome to Your Virtual Internship!'
  WHEN 'check_in' THEN '📝 Check-in: How are things going?'
  WHEN 'feedback_followup' THEN '💬 Feedback on Your Recent Submission'
  WHEN 'reminder' THEN '⏰ Reminder: Upcoming Task Deadline'
  WHEN 'encouragement' THEN '🎉 Great Progress Update!'
  WHEN 'milestone' THEN '🏆 Milestone Achievement!'
  ELSE 'Message from Internship Coordinator'
END
WHERE subject IS NULL AND status = 'sent';

-- ============================================================================
-- PART 8: Comments for Documentation
-- ============================================================================

COMMENT ON COLUMN internship_supervisor_messages.idem_key IS 
  'Idempotency key format: {action}:{session_id}:{user_id}:{extra}. Prevents duplicate message sends.';

COMMENT ON COLUMN internship_supervisor_messages.direction IS 
  'Message direction: outbound (supervisor->student) or inbound (student->supervisor)';

COMMENT ON COLUMN internship_supervisor_messages.sender_type IS 
  'Who sent the message: supervisor, user, or system';

COMMENT ON COLUMN internship_supervisor_messages.thread_id IS 
  'Optional thread ID for grouping related messages (for future threading feature)';

COMMENT ON COLUMN internship_supervisor_messages.is_read IS 
  'Whether the student has read this message (for outbound) or supervisor has read (for inbound)';

COMMENT ON FUNCTION increment_interactions IS 
  'Safely increment interaction count for a session/user pair. Creates record if not exists.';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify critical components exist
DO $$ 
BEGIN
  -- Check if idem_key column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'internship_supervisor_messages' 
    AND column_name = 'idem_key'
  ) THEN
    RAISE EXCEPTION 'Migration failed: idem_key column not created';
  END IF;

  -- Check if RPC function exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'increment_interactions'
  ) THEN
    RAISE EXCEPTION 'Migration failed: increment_interactions function not created';
  END IF;

  RAISE NOTICE '✅ Supervisor MVP migration completed successfully';
  RAISE NOTICE '✅ Idempotency keys enabled';
  RAISE NOTICE '✅ Email-style fields added';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '✅ Performance indexes created';
END $$;

