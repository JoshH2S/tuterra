-- ============================================================================
-- Cleanup: Remove Old Lock-Based Architecture
-- ============================================================================
-- This migration removes the legacy distributed locking system and 
-- faux transaction functions that have been replaced by idempotency keys.
-- ============================================================================

-- Drop transaction functions (no longer needed with idempotency)
DROP FUNCTION IF EXISTS begin_transaction();
DROP FUNCTION IF EXISTS commit_transaction();
DROP FUNCTION IF EXISTS rollback_transaction();

-- Drop lock metric recording function (if exists)
DROP FUNCTION IF EXISTS record_lock_metric(
  TEXT, UUID, UUID, INTEGER, BOOLEAN, TEXT
);

-- Drop supervisor_locks table (replaced by idempotency keys)
DROP TABLE IF EXISTS supervisor_locks CASCADE;

-- Drop any lock-related indexes
DROP INDEX IF EXISTS idx_supervisor_locks_session;
DROP INDEX IF EXISTS idx_supervisor_locks_expires;
DROP INDEX IF EXISTS idx_supervisor_locks_key;

-- Optional: Clean up any orphaned lock metrics table if it exists
DROP TABLE IF EXISTS supervisor_lock_metrics CASCADE;

-- Verify cleanup
DO $$ 
BEGIN
  -- Check that supervisor_locks table is gone
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'supervisor_locks'
  ) THEN
    RAISE EXCEPTION 'Cleanup failed: supervisor_locks table still exists';
  END IF;

  -- Check that transaction functions are gone
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname IN ('begin_transaction', 'commit_transaction', 'rollback_transaction')
  ) THEN
    RAISE EXCEPTION 'Cleanup failed: transaction functions still exist';
  END IF;

  RAISE NOTICE '✅ Cleanup complete: Lock-based architecture removed';
  RAISE NOTICE '✅ System now fully idempotency-based';
END $$;

