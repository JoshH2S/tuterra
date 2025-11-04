-- ============================================================================
-- FIX INTERNSHIP SCHEMA ISSUES
-- ============================================================================
-- This script fixes the two identified schema mismatches:
-- 1. Add missing 'content' and 'description' columns to internship_resources
-- 2. Fix internship_messages schema mismatch (old vs new columns)
-- ============================================================================

-- ============================================================================
-- FIX 1: ADD MISSING COLUMNS TO INTERNSHIP_RESOURCES
-- ============================================================================

-- Add the missing columns that the edge function expects
ALTER TABLE internship_resources 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS content TEXT;

-- Verify the fix
SELECT 'internship_resources columns after fix:' AS status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'internship_resources'
ORDER BY ordinal_position;

-- ============================================================================
-- FIX 2: RESOLVE INTERNSHIP_MESSAGES SCHEMA MISMATCH
-- ============================================================================

-- The issue is that we have both OLD and NEW schema columns, but the edge function
-- uses NEW schema while OLD schema has NOT NULL constraints.
-- 
-- Strategy: Make the OLD schema columns nullable so they don't conflict,
-- and ensure the NEW schema columns are used properly.

-- Make old schema columns nullable to prevent constraint violations
ALTER TABLE internship_messages 
ALTER COLUMN sender DROP NOT NULL,
ALTER COLUMN subject DROP NOT NULL,
ALTER COLUMN content DROP NOT NULL,
ALTER COLUMN sent_at DROP NOT NULL;

-- Ensure new schema columns exist (they should already exist based on investigation)
ALTER TABLE internship_messages 
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS body TEXT,
ADD COLUMN IF NOT EXISTS related_task_id UUID REFERENCES internship_tasks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Create a function to migrate old data to new schema format
CREATE OR REPLACE FUNCTION migrate_old_message_data()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Update records that have old schema data but missing new schema data
  UPDATE internship_messages
  SET 
    sender_name = COALESCE(sender_name, sender),
    body = COALESCE(body, content),
    timestamp = COALESCE(timestamp, sent_at)
  WHERE 
    (sender_name IS NULL AND sender IS NOT NULL) OR
    (body IS NULL AND content IS NOT NULL) OR
    (timestamp IS NULL AND sent_at IS NOT NULL);
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Run the migration
SELECT migrate_old_message_data() AS migrated_records;

-- Verify the fix
SELECT 'internship_messages columns after fix:' AS status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'internship_messages'
  AND column_name IN ('sender', 'sender_name', 'content', 'body', 'subject', 'sent_at', 'timestamp')
ORDER BY column_name;

-- Show sample of migrated data
SELECT 'Sample migrated data:' AS status;
SELECT 
  id,
  sender,
  sender_name,
  content,
  body,
  sent_at,
  timestamp
FROM internship_messages 
LIMIT 3;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify internship_resources now has required columns
SELECT 
  'internship_resources' AS table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources' 
    AND column_name = 'content'
  ) THEN '✅ content column added' 
  ELSE '❌ content column still missing' END AS content_status,
  
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources' 
    AND column_name = 'description'
  ) THEN '✅ description column added' 
  ELSE '❌ description column still missing' END AS description_status;

-- Verify internship_messages constraints are relaxed
SELECT 
  'internship_messages' AS table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_messages' 
    AND column_name = 'sender'
    AND is_nullable = 'YES'
  ) THEN '✅ sender column is now nullable' 
  ELSE '❌ sender column still NOT NULL' END AS sender_nullable_status,
  
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_messages' 
    AND column_name = 'sender_name'
  ) THEN '✅ sender_name column exists' 
  ELSE '❌ sender_name column missing' END AS sender_name_status;

-- Clean up the migration function
DROP FUNCTION IF EXISTS migrate_old_message_data();

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT '=== SCHEMA FIXES COMPLETED ===' AS summary;
SELECT 'Both internship_resources and internship_messages schema issues should now be resolved.' AS result;
SELECT 'The edge function should now work without constraint violations.' AS expected_outcome;

-- ============================================================================
-- END OF FIX SCRIPT
-- ============================================================================


