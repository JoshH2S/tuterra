-- ============================================================================
-- INVESTIGATION SCRIPT FOR INTERNSHIP SCHEMA ISSUES
-- ============================================================================
-- This script investigates the two errors:
-- 1. Missing 'content' column in 'internship_resources' table
-- 2. Null 'sender' constraint violation in 'internship_messages' table
-- ============================================================================

-- ============================================================================
-- PART 1: INVESTIGATE INTERNSHIP_RESOURCES TABLE
-- ============================================================================

SELECT '=== INTERNSHIP_RESOURCES TABLE STRUCTURE ===' AS investigation_section;

-- Check if the table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'internship_resources'
    ) THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END AS table_exists;

-- Show all columns in internship_resources table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'internship_resources'
ORDER BY ordinal_position;

-- Check specifically for 'content', 'description', and other expected columns
SELECT 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources' 
    AND column_name = 'content'
  ) THEN 'YES' ELSE 'NO' END AS has_content_column,
  
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources' 
    AND column_name = 'description'
  ) THEN 'YES' ELSE 'NO' END AS has_description_column,
  
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources' 
    AND column_name = 'link'
  ) THEN 'YES' ELSE 'NO' END AS has_link_column,
  
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources' 
    AND column_name = 'type'
  ) THEN 'YES' ELSE 'NO' END AS has_type_column;

-- Show sample data from internship_resources (if any)
SELECT 'Sample data from internship_resources:' AS info;
SELECT * FROM internship_resources LIMIT 3;

-- ============================================================================
-- PART 2: INVESTIGATE INTERNSHIP_MESSAGES TABLE
-- ============================================================================

SELECT '=== INTERNSHIP_MESSAGES TABLE STRUCTURE ===' AS investigation_section;

-- Check if the table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'internship_messages'
    ) THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END AS table_exists;

-- Show all columns in internship_messages table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'internship_messages'
ORDER BY ordinal_position;

-- Check for 'sender' vs 'sender_name' column
SELECT 
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_messages' 
    AND column_name = 'sender'
  ) THEN 'YES' ELSE 'NO' END AS has_sender_column,
  
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_messages' 
    AND column_name = 'sender_name'
  ) THEN 'YES' ELSE 'NO' END AS has_sender_name_column;

-- Check constraints on internship_messages
SELECT
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  CASE con.contype
    WHEN 'c' THEN 'CHECK'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'n' THEN 'NOT NULL'
    ELSE con.contype::text
  END AS constraint_type_description,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
INNER JOIN pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'internship_messages'
  AND nsp.nspname = 'public'
ORDER BY con.contype;

-- Check for NOT NULL constraints specifically
SELECT 
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'internship_messages'
  AND (column_name LIKE '%sender%' OR column_name LIKE '%content%' OR column_name LIKE '%body%')
ORDER BY column_name;

-- Show sample data from internship_messages (if any)
SELECT 'Sample data from internship_messages:' AS info;
SELECT * FROM internship_messages LIMIT 3;

-- ============================================================================
-- PART 3: CHECK FOR RELATED/SIMILAR TABLES
-- ============================================================================

SELECT '=== OTHER RELATED TABLES ===' AS investigation_section;

-- Check for internship_messages_v2
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'internship_messages_v2'
    ) THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END AS internship_messages_v2_exists;

-- Check for internship_task_resources (might be confused with internship_resources)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'internship_task_resources'
    ) THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END AS internship_task_resources_exists;

-- Show internship_task_resources columns if it exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'internship_task_resources'
ORDER BY ordinal_position;

-- ============================================================================
-- PART 4: CHECK RECENT MIGRATIONS
-- ============================================================================

SELECT '=== RECENT MIGRATIONS ===' AS investigation_section;

-- Check if supabase_migrations table exists and show recent migrations
SELECT 
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY executed_at DESC
LIMIT 20;

-- ============================================================================
-- PART 5: SUMMARY OF FINDINGS
-- ============================================================================

SELECT '=== SUMMARY ===' AS investigation_section;

-- Final summary query
SELECT 
  'INTERNSHIP_RESOURCES' AS table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources' 
    AND column_name = 'content'
  ) THEN '✓ Has content column' 
  ELSE '✗ Missing content column - THIS IS THE ISSUE!' END AS content_column_status,
  
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources' 
    AND column_name = 'description'
  ) THEN '✓ Has description column' 
  ELSE '✗ Missing description column' END AS description_column_status

UNION ALL

SELECT 
  'INTERNSHIP_MESSAGES' AS table_name,
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_messages' 
    AND column_name = 'sender'
  ) THEN '✓ Has sender column (OLD SCHEMA)' 
  ELSE '✗ Missing sender column (expected for NEW SCHEMA)' END AS sender_column_status,
  
  CASE WHEN EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_messages' 
    AND column_name = 'sender_name'
    AND is_nullable = 'NO'
  ) THEN '✓ Has sender_name NOT NULL - CODE SHOULD USE THIS' 
  ELSE '⚠ sender_name is nullable or missing' END AS sender_name_status;

-- ============================================================================
-- RECOMMENDED FIXES (DO NOT RUN AUTOMATICALLY - REVIEW FIRST)
-- ============================================================================

SELECT '=== RECOMMENDED FIXES (COMMENTED OUT) ===' AS investigation_section;

/*
-- FIX 1: Add missing columns to internship_resources
ALTER TABLE internship_resources 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS content TEXT;

-- FIX 2: Ensure internship_messages has the correct schema
-- Option A: If using OLD schema with 'sender', the code needs to be updated
-- Option B: If using NEW schema with 'sender_name', verify NOT NULL constraint

-- Check current schema first, then uncomment the appropriate fix:

-- If you want to keep NEW schema (with sender_name):
ALTER TABLE internship_messages 
ALTER COLUMN sender_name SET NOT NULL;

-- If you want to support OLD schema (add sender column back):
ALTER TABLE internship_messages 
ADD COLUMN IF NOT EXISTS sender TEXT;

-- Update existing records if migrating from old to new schema:
UPDATE internship_messages
SET sender_name = sender
WHERE sender_name IS NULL AND sender IS NOT NULL;
*/

-- ============================================================================
-- END OF INVESTIGATION SCRIPT
-- ============================================================================



