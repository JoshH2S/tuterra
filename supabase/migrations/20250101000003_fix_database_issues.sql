-- Fix database issues: remove orphaned cron job and fix company applications upsert

-- ============================================================================
-- 1. Remove orphaned cron job for supervisor_locks cleanup
-- ============================================================================

-- Remove the cron job that tries to clean expired supervisor locks
-- The supervisor_locks table was removed in 20250930000003_cleanup_locks_transactions.sql
-- but the cron job was not cleaned up
SELECT cron.unschedule('cleanup-expired-supervisor-locks');

-- Also remove the function that references the non-existent table
DROP FUNCTION IF EXISTS clean_expired_supervisor_locks();

-- ============================================================================
-- 2. Fix company applications table to handle upserts properly
-- ============================================================================

-- The issue is that when we upsert with an existing id, it can conflict with the primary key
-- even when using the unique constraint for conflict resolution.
-- We need to modify the table to use gen_random_uuid() consistently with our migration pattern.

-- First, let's ensure the table uses the correct UUID generation function
ALTER TABLE public.internship_company_applications 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the fix
DO $$ 
BEGIN
  -- Check that the cron job is gone
  IF EXISTS (
    SELECT 1 FROM cron.job 
    WHERE jobname = 'cleanup-expired-supervisor-locks'
  ) THEN
    RAISE EXCEPTION 'Cleanup failed: cron job still exists';
  END IF;

  -- Check that the function is gone
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'clean_expired_supervisor_locks'
  ) THEN
    RAISE EXCEPTION 'Cleanup failed: cleanup function still exists';
  END IF;

  RAISE NOTICE '✅ Database issues fixed:';
  RAISE NOTICE '  - Removed orphaned supervisor_locks cron job';
  RAISE NOTICE '  - Fixed company applications UUID generation';
END $$;
