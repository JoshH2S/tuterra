-- Comprehensive migration for two-way messaging system
-- This migration adds all the missing tables and fixes existing constraint issues

-- First, let's fix the existing supervisor_locks table constraints
-- Drop the problematic foreign key constraints
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_session' AND table_name = 'supervisor_locks') THEN
        ALTER TABLE public.supervisor_locks DROP CONSTRAINT fk_session;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if constraints don't exist
END $$;

-- Add proper foreign key constraints for supervisor_locks
ALTER TABLE public.supervisor_locks 
ADD CONSTRAINT fk_supervisor_locks_session 
FOREIGN KEY (session_id) REFERENCES public.internship_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.supervisor_locks 
ADD CONSTRAINT fk_supervisor_locks_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix the unique constraint for internship_supervisor_state if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_supervisor_session_user' 
        AND table_name = 'internship_supervisor_state'
    ) THEN
        -- First, handle duplicates by keeping the most recent record
        WITH duplicates AS (
            SELECT 
                session_id,
                user_id,
                array_agg(id ORDER BY updated_at DESC NULLS LAST, created_at DESC) as id_list,
                bool_or(onboarding_completed) as keep_onboarding_completed,
                sum(total_interactions) as keep_total_interactions
            FROM internship_supervisor_state
            GROUP BY session_id, user_id
            HAVING COUNT(*) > 1
        )
        UPDATE internship_supervisor_state iss
        SET 
            onboarding_completed = d.keep_onboarding_completed,
            total_interactions = d.keep_total_interactions
        FROM duplicates d
        WHERE iss.id = d.id_list[1] -- Keep the first (most recent) record
        AND iss.session_id = d.session_id 
        AND iss.user_id = d.user_id;

        -- Delete older duplicate records
        WITH duplicates AS (
            SELECT 
                session_id,
                user_id,
                array_agg(id ORDER BY updated_at DESC NULLS LAST, created_at DESC) as id_list
            FROM internship_supervisor_state
            GROUP BY session_id, user_id
            HAVING COUNT(*) > 1
        )
        DELETE FROM internship_supervisor_state
        WHERE id IN (
            SELECT unnest(id_list[2:]) -- Delete all but the first (most recent)
            FROM duplicates
        );

        -- Add the unique constraint
        ALTER TABLE public.internship_supervisor_state 
        ADD CONSTRAINT unique_supervisor_session_user UNIQUE (session_id, user_id);
    END IF;
END $$;

-- Now add the new tables for two-way messaging

-- 1. Enhanced messages table that stores all communications
CREATE TABLE IF NOT EXISTS public.internship_messages_v2 (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID           NOT NULL  REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id        UUID           NOT NULL  REFERENCES auth.users(id) ON DELETE CASCADE, -- the intern
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

-- 2. Table for intern responses to messages
CREATE TABLE IF NOT EXISTS public.internship_responses (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id     UUID           NOT NULL  REFERENCES internship_messages_v2(id) ON DELETE CASCADE,
  session_id     UUID           NOT NULL  REFERENCES internship_sessions(id) ON DELETE CASCADE,
  user_id        UUID           NOT NULL  REFERENCES auth.users(id) ON DELETE CASCADE, -- the intern
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

-- 3. Configuration table for app settings
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
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

-- Add RLS policies
ALTER TABLE internship_messages_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for internship_messages_v2
DROP POLICY IF EXISTS "Interns can view own messages" ON internship_messages_v2;
CREATE POLICY "Interns can view own messages" ON internship_messages_v2
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Interns can insert own messages" ON internship_messages_v2;
CREATE POLICY "Interns can insert own messages" ON internship_messages_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id AND sender_type = 'intern');

DROP POLICY IF EXISTS "Service role can manage all messages" ON internship_messages_v2;
CREATE POLICY "Service role can manage all messages" ON internship_messages_v2
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for internship_responses
DROP POLICY IF EXISTS "Interns can view own responses" ON internship_responses;
CREATE POLICY "Interns can view own responses" ON internship_responses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Interns can insert own responses" ON internship_responses;
CREATE POLICY "Interns can insert own responses" ON internship_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all responses" ON internship_responses;
CREATE POLICY "Service role can manage all responses" ON internship_responses
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS policies for app_config
DROP POLICY IF EXISTS "Service role can manage config" ON app_config;
CREATE POLICY "Service role can manage config" ON app_config
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert default configuration values
INSERT INTO app_config (key, value, description) VALUES 
  ('supabase_url', 'https://your-project.supabase.co', 'Supabase project URL for edge function calls')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO app_config (key, value, description) VALUES 
  ('service_role_key', 'your-service-role-key', 'Service role key for authenticated edge function calls')
  ON CONFLICT (key) DO NOTHING;

-- Add function to migrate existing supervisor messages to new structure
CREATE OR REPLACE FUNCTION migrate_supervisor_messages_to_v2()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
  default_session_id UUID;
  default_user_id UUID;
BEGIN
  -- Get a default session_id and user_id for messages with NULL values
  -- First, try to get the most common session_id and user_id
  SELECT session_id INTO default_session_id
  FROM internship_supervisor_messages
  WHERE session_id IS NOT NULL
  GROUP BY session_id
  ORDER BY COUNT(*) DESC
  LIMIT 1;
  
  SELECT user_id INTO default_user_id
  FROM internship_supervisor_messages
  WHERE user_id IS NOT NULL
  GROUP BY user_id
  ORDER BY COUNT(*) DESC
  LIMIT 1;
  
  -- If we still don't have defaults, try to get any valid session and user
  IF default_session_id IS NULL THEN
    SELECT id INTO default_session_id
    FROM internship_sessions
    LIMIT 1;
  END IF;
  
  IF default_user_id IS NULL THEN
    SELECT id INTO default_user_id
    FROM auth.users
    LIMIT 1;
  END IF;
  
  -- If we still don't have defaults, we can't proceed
  IF default_session_id IS NULL OR default_user_id IS NULL THEN
    RAISE NOTICE 'Cannot migrate messages: No valid session_id or user_id found';
    RETURN 0;
  END IF;
  
  -- Insert messages with valid session_id and user_id
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
    COALESCE(ism.session_id, default_session_id) as session_id,
    COALESCE(ism.user_id, default_user_id) as user_id,
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

-- Add trigger to automatically sync new supervisor messages to v2 table
CREATE OR REPLACE FUNCTION sync_supervisor_messages_to_v2()
RETURNS TRIGGER AS $$
DECLARE
  default_session_id UUID;
  default_user_id UUID;
BEGIN
  IF NEW.status = 'sent' THEN
    -- Handle NULL session_id or user_id
    IF NEW.session_id IS NULL OR NEW.user_id IS NULL THEN
      -- Get a default session_id if needed
      IF NEW.session_id IS NULL THEN
        SELECT id INTO default_session_id
        FROM internship_sessions
        LIMIT 1;
      ELSE
        default_session_id := NEW.session_id;
      END IF;
      
      -- Get a default user_id if needed
      IF NEW.user_id IS NULL THEN
        SELECT id INTO default_user_id
        FROM auth.users
        LIMIT 1;
      ELSE
        default_user_id := NEW.user_id;
      END IF;
      
      -- Skip if we can't find valid defaults
      IF default_session_id IS NULL OR default_user_id IS NULL THEN
        RETURN NEW;
      END IF;
    ELSE
      default_session_id := NEW.session_id;
      default_user_id := NEW.user_id;
    END IF;
    
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
      default_session_id,
      default_user_id,
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

DROP TRIGGER IF EXISTS trigger_sync_supervisor_messages ON internship_supervisor_messages;
CREATE TRIGGER trigger_sync_supervisor_messages
  AFTER INSERT OR UPDATE ON internship_supervisor_messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_supervisor_messages_to_v2(); 

-- Add helper function to get config values
CREATE OR REPLACE FUNCTION get_app_config(config_key TEXT)
RETURNS TEXT AS $$
DECLARE
  config_value TEXT;
BEGIN
  SELECT value INTO config_value 
  FROM app_config 
  WHERE key = config_key;
  
  RETURN config_value;
END;
$$ LANGUAGE plpgsql;

-- Add functions for response processing and monitoring
CREATE OR REPLACE FUNCTION get_response_processing_metrics()
RETURNS TABLE(
  total_pending INTEGER,
  total_processed INTEGER,
  total_escalated INTEGER,
  total_failed INTEGER,
  avg_processing_time_minutes NUMERIC,
  escalation_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(CASE WHEN processing_status = 'pending' THEN 1 END)::INTEGER as total_pending,
    COUNT(CASE WHEN processing_status = 'processed' THEN 1 END)::INTEGER as total_processed,
    COUNT(CASE WHEN processing_status = 'escalated' THEN 1 END)::INTEGER as total_escalated,
    COUNT(CASE WHEN processing_status = 'failed' THEN 1 END)::INTEGER as total_failed,
    AVG(
      CASE 
        WHEN processed = true 
        THEN EXTRACT(EPOCH FROM (created_at - received_at)) / 60.0 
      END
    )::NUMERIC(10,2) as avg_processing_time_minutes,
    (COUNT(CASE WHEN processing_status = 'escalated' THEN 1 END)::NUMERIC / 
     NULLIF(COUNT(CASE WHEN processed = true THEN 1 END), 0) * 100)::NUMERIC(5,2) as escalation_rate
  FROM internship_responses
  WHERE created_at >= NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Add function to get response stats by session
CREATE OR REPLACE FUNCTION get_session_response_stats(p_session_id UUID)
RETURNS TABLE(
  session_id UUID,
  total_messages INTEGER,
  total_responses INTEGER,
  response_rate NUMERIC,
  avg_response_time_hours NUMERIC,
  pending_responses INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_session_id,
    COUNT(DISTINCT m.id)::INTEGER as total_messages,
    COUNT(r.id)::INTEGER as total_responses,
    (COUNT(r.id)::NUMERIC / NULLIF(COUNT(DISTINCT m.id), 0) * 100)::NUMERIC(5,2) as response_rate,
    AVG(EXTRACT(EPOCH FROM (r.received_at - m.sent_at)) / 3600.0)::NUMERIC(10,2) as avg_response_time_hours,
    COUNT(CASE WHEN r.processing_status = 'pending' THEN 1 END)::INTEGER as pending_responses
  FROM internship_messages_v2 m
  LEFT JOIN internship_responses r ON m.id = r.message_id
  WHERE m.session_id = p_session_id
  AND m.sender_type IN ('supervisor', 'team');
END;
$$ LANGUAGE plpgsql;

-- Add cleanup function for old processed responses
CREATE OR REPLACE FUNCTION cleanup_old_responses()
RETURNS void AS $$
BEGIN
  -- Delete processed responses older than 30 days
  DELETE FROM internship_responses 
  WHERE processed = true 
  AND created_at < NOW() - INTERVAL '30 days';
  
  -- Delete old supervisor lock metrics
  DELETE FROM supervisor_lock_metrics 
  WHERE recorded_at < NOW() - INTERVAL '7 days';
  
  -- Delete expired locks (safety cleanup)
  DELETE FROM supervisor_locks 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add monitoring view for easy response tracking
CREATE OR REPLACE VIEW response_processing_dashboard AS
SELECT 
  r.id,
  r.session_id,
  r.user_id,
  r.content,
  r.reply_to_type,
  r.reply_to_name,
  r.received_at,
  r.processed,
  r.processing_status,
  r.auto_response_generated,
  r.escalation_reason,
  m.sender_name as original_sender,
  m.subject as original_subject,
  m.sent_at as original_sent_at,
  EXTRACT(EPOCH FROM (r.received_at - m.sent_at)) / 3600.0 as response_time_hours,
  CASE 
    WHEN r.processed = false THEN EXTRACT(EPOCH FROM (NOW() - r.received_at)) / 60.0
    ELSE NULL 
  END as pending_minutes
FROM internship_responses r
JOIN internship_messages_v2 m ON r.message_id = m.id
ORDER BY r.received_at DESC;

-- Fix the team schedules table to ensure proper status handling
UPDATE internship_team_schedules 
SET status = 'pending' 
WHERE status IS NULL;

-- Add default for status column if not exists
DO $$
BEGIN
    ALTER TABLE internship_team_schedules 
    ALTER COLUMN status SET DEFAULT 'pending';
EXCEPTION WHEN OTHERS THEN
    NULL; -- Column might already have default
END $$;

-- Add constraints for team schedules if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_valid_status'
        AND table_name = 'internship_team_schedules'
    ) THEN
        ALTER TABLE internship_team_schedules 
        ADD CONSTRAINT check_valid_status 
        CHECK (status IN ('pending', 'sent', 'cancelled', 'failed'));
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_valid_interaction_type'
        AND table_name = 'internship_team_schedules'
    ) THEN
        ALTER TABLE internship_team_schedules 
        ADD CONSTRAINT check_valid_interaction_type 
        CHECK (interaction_type IN ('introduction', 'project_assignment', 'casual_check_in', 'meeting_invite', 'feedback_request', 'collaboration', 'project_update', 'casual_chat', 'meeting'));
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Add unique index for pending team interactions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_unique_pending_team_interactions'
    ) THEN
        -- First clean up any duplicates
        WITH duplicates AS (
            SELECT 
                session_id,
                user_id,
                interaction_type,
                array_agg(id ORDER BY created_at DESC) as id_list
            FROM internship_team_schedules
            WHERE status = 'pending'
            GROUP BY session_id, user_id, interaction_type
            HAVING COUNT(*) > 1
        )
        UPDATE internship_team_schedules its
        SET status = 'cancelled'
        WHERE its.id IN (
            SELECT unnest(id_list[2:]) -- Keep first (most recent) item, cancel others
            FROM duplicates
        );

        -- Add the unique index
        CREATE UNIQUE INDEX idx_unique_pending_team_interactions 
        ON internship_team_schedules(session_id, user_id, interaction_type) 
        WHERE status = 'pending';
    END IF;
END $$;

-- Migrate existing supervisor messages to the new v2 table
SELECT migrate_supervisor_messages_to_v2(); 