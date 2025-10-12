-- Create functions for transaction management in edge functions
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void AS $$
BEGIN
    -- Start a new transaction
    -- This is a no-op since transactions are automatically started
    -- but we keep it for explicit transaction boundary marking
    NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void AS $$
BEGIN
    -- Commit the current transaction
    COMMIT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void AS $$
BEGIN
    -- Rollback the current transaction
    ROLLBACK;
END;
$$ LANGUAGE plpgsql; 