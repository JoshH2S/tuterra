-- ============================================================================
-- Supervisor Metrics Functions
-- ============================================================================
-- Analytics functions for supervisor messaging performance
-- - Sent count (last 30 days)
-- - Open rate (last 30 days)
-- - Median reply time
-- ============================================================================

-- Function to get sent message count for last N days
CREATE OR REPLACE FUNCTION get_supervisor_sent_count(
  p_session UUID,
  p_user UUID,
  p_days INT DEFAULT 30
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
    AND sent_at >= NOW() - (p_days || ' days')::INTERVAL;
$$;

-- Function to get open rate for last N days
CREATE OR REPLACE FUNCTION get_supervisor_open_rate(
  p_session UUID,
  p_user UUID,
  p_days INT DEFAULT 30
) RETURNS NUMERIC
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH outbound_messages AS (
    SELECT 
      COUNT(*) FILTER (WHERE is_read = TRUE) AS opened,
      COUNT(*) AS total
    FROM internship_supervisor_messages
    WHERE session_id = p_session
      AND user_id = p_user
      AND direction = 'outbound'
      AND status = 'sent'
      AND sent_at >= NOW() - (p_days || ' days')::INTERVAL
  )
  SELECT 
    CASE 
      WHEN total = 0 THEN 0
      ELSE ROUND((opened::NUMERIC / total::NUMERIC) * 100, 1)
    END
  FROM outbound_messages;
$$;

-- Function to get median reply time in hours
CREATE OR REPLACE FUNCTION get_supervisor_median_reply_time(
  p_session UUID,
  p_user UUID,
  p_days INT DEFAULT 30
) RETURNS NUMERIC
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH reply_times AS (
    SELECT 
      EXTRACT(EPOCH FROM (inbound.sent_at - outbound.sent_at)) / 3600.0 AS hours_to_reply
    FROM internship_supervisor_messages AS outbound
    INNER JOIN internship_supervisor_messages AS inbound
      ON inbound.thread_id = outbound.id
      OR (inbound.session_id = outbound.session_id 
          AND inbound.user_id = outbound.user_id 
          AND inbound.sent_at > outbound.sent_at)
    WHERE outbound.session_id = p_session
      AND outbound.user_id = p_user
      AND outbound.direction = 'outbound'
      AND inbound.direction = 'inbound'
      AND outbound.sent_at >= NOW() - (p_days || ' days')::INTERVAL
      AND inbound.sent_at >= NOW() - (p_days || ' days')::INTERVAL
    ORDER BY hours_to_reply
  ),
  median_calc AS (
    SELECT 
      hours_to_reply,
      ROW_NUMBER() OVER (ORDER BY hours_to_reply) AS row_num,
      COUNT(*) OVER () AS total_count
    FROM reply_times
  )
  SELECT 
    CASE 
      WHEN total_count = 0 THEN NULL
      WHEN total_count % 2 = 1 THEN
        (SELECT hours_to_reply FROM median_calc WHERE row_num = (total_count + 1) / 2)
      ELSE
        (SELECT AVG(hours_to_reply) FROM median_calc WHERE row_num IN (total_count / 2, total_count / 2 + 1))
    END AS median_hours
  FROM median_calc
  LIMIT 1;
$$;

-- Function to get comprehensive metrics summary
CREATE OR REPLACE FUNCTION get_supervisor_metrics_summary(
  p_session UUID,
  p_user UUID,
  p_days INT DEFAULT 30
) RETURNS TABLE (
  sent_count INTEGER,
  open_rate NUMERIC,
  median_reply_hours NUMERIC,
  total_replies INTEGER,
  unread_count INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    get_supervisor_sent_count(p_session, p_user, p_days) AS sent_count,
    get_supervisor_open_rate(p_session, p_user, p_days) AS open_rate,
    get_supervisor_median_reply_time(p_session, p_user, p_days) AS median_reply_hours,
    (
      SELECT COUNT(*)::INTEGER
      FROM internship_supervisor_messages
      WHERE session_id = p_session
        AND user_id = p_user
        AND direction = 'inbound'
        AND status = 'sent'
        AND sent_at >= NOW() - (p_days || ' days')::INTERVAL
    ) AS total_replies,
    (
      SELECT COUNT(*)::INTEGER
      FROM internship_supervisor_messages
      WHERE session_id = p_session
        AND user_id = p_user
        AND direction = 'outbound'
        AND status = 'sent'
        AND is_read = FALSE
    ) AS unread_count;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_supervisor_sent_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_supervisor_open_rate TO authenticated;
GRANT EXECUTE ON FUNCTION get_supervisor_median_reply_time TO authenticated;
GRANT EXECUTE ON FUNCTION get_supervisor_metrics_summary TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION get_supervisor_sent_count IS 
  'Get count of sent supervisor messages in last N days (default 30)';

COMMENT ON FUNCTION get_supervisor_open_rate IS 
  'Get percentage of opened messages in last N days (default 30)';

COMMENT ON FUNCTION get_supervisor_median_reply_time IS 
  'Get median time in hours for student to reply to supervisor messages';

COMMENT ON FUNCTION get_supervisor_metrics_summary IS 
  'Get comprehensive metrics summary for supervisor messaging performance';

-- Verify functions were created
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_supervisor_sent_count') THEN
    RAISE EXCEPTION 'Metrics migration failed: get_supervisor_sent_count function not created';
  END IF;

  RAISE NOTICE '✅ Supervisor metrics functions created successfully';
END $$;

