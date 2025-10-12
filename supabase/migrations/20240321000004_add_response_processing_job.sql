-- Add background processing for intern responses using pg_cron

-- Create a function to process pending responses
CREATE OR REPLACE FUNCTION process_pending_responses()
RETURNS void AS $$
DECLARE
  response_record RECORD;
  processed_count INTEGER := 0;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get configuration values from config table
  supabase_url := get_app_config('supabase_url');
  service_key := get_app_config('service_role_key');
  
  -- Skip processing if config is not properly set
  IF supabase_url IS NULL OR service_key IS NULL OR 
     supabase_url = 'https://your-project.supabase.co' OR 
     service_key = 'your-service-role-key' THEN
    RAISE NOTICE 'Skipping response processing - configuration not set. Please update app_config table.';
    RETURN;
  END IF;
  
  -- Get up to 10 pending responses
  FOR response_record IN 
    SELECT r.*, m.sender_type, m.sender_name, m.content as original_content
    FROM internship_responses r
    JOIN internship_messages_v2 m ON r.message_id = m.id
    WHERE r.processed = false 
    AND r.processing_status = 'pending'
    ORDER BY r.received_at ASC
    LIMIT 10
  LOOP
    BEGIN
      -- Call the edge function to process this response
      PERFORM net.http_post(
        url := supabase_url || '/functions/v1/process-internship-responses',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object('response_id', response_record.id)
      );
      
      processed_count := processed_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error and mark response as failed
      UPDATE internship_responses 
      SET processed = true, processing_status = 'failed'
      WHERE id = response_record.id;
      
      RAISE NOTICE 'Failed to process response %: %', response_record.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Processed % responses', processed_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule the job to run every 2 minutes
SELECT cron.schedule(
  'process-internship-responses',
  '*/2 * * * *',  -- Every 2 minutes
  'SELECT process_pending_responses()'
);

-- Create a cleanup job for old processed responses (optional)
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

-- Schedule cleanup job to run daily at 2 AM
SELECT cron.schedule(
  'cleanup-old-internship-data',
  '0 2 * * *',  -- Daily at 2 AM
  'SELECT cleanup_old_responses()'
);

-- Create monitoring function to track response processing metrics
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

-- Create a function to get response stats by session
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

-- Create a view for easy monitoring
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

-- Create a configuration table for storing app-specific settings
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration values
INSERT INTO app_config (key, value, description) VALUES 
  ('supabase_url', 'https://your-project.supabase.co', 'Supabase project URL for edge function calls')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO app_config (key, value, description) VALUES 
  ('service_role_key', 'your-service-role-key', 'Service role key for authenticated edge function calls')
  ON CONFLICT (key) DO NOTHING;

-- Helper function to get config values
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