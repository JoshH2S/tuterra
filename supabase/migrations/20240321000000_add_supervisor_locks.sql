-- First, create a temporary table to identify duplicates
CREATE TEMP TABLE duplicate_supervisor_states AS
WITH duplicates AS (
    SELECT 
        session_id,
        user_id,
        COUNT(*) as count,
        array_agg(id ORDER BY created_at DESC) as id_list
    FROM internship_supervisor_state
    GROUP BY session_id, user_id
    HAVING COUNT(*) > 1
)
SELECT 
    d.*,
    s.created_at,
    s.onboarding_completed,
    s.total_interactions
FROM duplicates d
JOIN internship_supervisor_state s ON s.id = ANY(d.id_list);

-- Keep the most recent record for each duplicate set and merge relevant data
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT DISTINCT session_id, user_id 
        FROM duplicate_supervisor_states
    ) LOOP
        -- Get the most recent record's ID
        WITH ordered_records AS (
            SELECT 
                id,
                created_at,
                onboarding_completed,
                total_interactions,
                ROW_NUMBER() OVER (PARTITION BY session_id, user_id ORDER BY created_at DESC) as rn
            FROM internship_supervisor_state
            WHERE session_id = r.session_id AND user_id = r.user_id
        )
        UPDATE internship_supervisor_state main
        SET 
            total_interactions = main.total_interactions + COALESCE(
                (SELECT SUM(total_interactions) 
                 FROM internship_supervisor_state 
                 WHERE session_id = r.session_id 
                 AND user_id = r.user_id 
                 AND id != main.id),
                0
            ),
            onboarding_completed = CASE 
                WHEN main.onboarding_completed THEN true
                ELSE EXISTS (
                    SELECT 1 
                    FROM internship_supervisor_state 
                    WHERE session_id = r.session_id 
                    AND user_id = r.user_id 
                    AND id != main.id 
                    AND onboarding_completed = true
                )
            END
        FROM ordered_records
        WHERE ordered_records.id = main.id
        AND ordered_records.rn = 1;

        -- Delete older duplicates
        DELETE FROM internship_supervisor_state
        WHERE session_id = r.session_id
        AND user_id = r.user_id
        AND id NOT IN (
            SELECT id
            FROM internship_supervisor_state
            WHERE session_id = r.session_id
            AND user_id = r.user_id
            ORDER BY created_at DESC
            LIMIT 1
        );
    END LOOP;
END $$;

-- Drop temporary table
DROP TABLE duplicate_supervisor_states;

-- Now add the unique constraint
ALTER TABLE internship_supervisor_state 
ADD CONSTRAINT unique_supervisor_session_user UNIQUE (session_id, user_id);

-- Create supervisor_locks table for distributed locking
CREATE TABLE IF NOT EXISTS supervisor_locks (
    lock_key TEXT PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    lock_type TEXT NOT NULL,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_session
        FOREIGN KEY (session_id, user_id)
        REFERENCES internship_supervisor_state(session_id, user_id)
        ON DELETE CASCADE
);

-- Index for faster lock expiration queries
CREATE INDEX IF NOT EXISTS idx_supervisor_locks_expiry 
ON supervisor_locks(expires_at);

-- Function to clean expired locks
CREATE OR REPLACE FUNCTION clean_expired_supervisor_locks()
RETURNS void AS $$
BEGIN
    DELETE FROM supervisor_locks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically clean expired locks
CREATE OR REPLACE FUNCTION trigger_clean_expired_locks()
RETURNS trigger AS $$
BEGIN
    PERFORM clean_expired_supervisor_locks();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clean_expired_locks_trigger
    BEFORE INSERT ON supervisor_locks
    EXECUTE FUNCTION trigger_clean_expired_locks();

-- Add background cleanup job (runs every 5 minutes)
SELECT cron.schedule(
    'cleanup-expired-supervisor-locks',  -- job name
    '*/5 * * * *',                      -- every 5 minutes
    'SELECT clean_expired_supervisor_locks()'
);

-- Add monitoring for lock timeouts
CREATE TABLE IF NOT EXISTS supervisor_lock_metrics (
    id BIGSERIAL PRIMARY KEY,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lock_type TEXT NOT NULL,
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    duration_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_details TEXT
);

-- Index for efficient querying of lock metrics
CREATE INDEX IF NOT EXISTS idx_supervisor_lock_metrics_recorded 
ON supervisor_lock_metrics(recorded_at);

-- Function to record lock metrics
CREATE OR REPLACE FUNCTION record_lock_metric(
    p_lock_type TEXT,
    p_session_id UUID,
    p_user_id UUID,
    p_duration_ms INTEGER,
    p_success BOOLEAN,
    p_error_details TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO supervisor_lock_metrics (
        lock_type, session_id, user_id, duration_ms, success, error_details
    ) VALUES (
        p_lock_type, p_session_id, p_user_id, p_duration_ms, p_success, p_error_details
    );
END;
$$ LANGUAGE plpgsql; 