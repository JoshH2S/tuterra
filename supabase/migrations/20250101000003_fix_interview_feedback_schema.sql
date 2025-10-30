-- Fix interview_feedback table schema to match the expected structure
-- This migration ensures the table has the correct column names

-- Check if the table exists and has the wrong column names
DO $$ 
BEGIN
  -- Check if areas_for_improvement column exists (old schema)
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'interview_feedback' 
    AND column_name = 'areas_for_improvement'
  ) THEN
    -- Rename areas_for_improvement to weaknesses
    ALTER TABLE interview_feedback RENAME COLUMN areas_for_improvement TO weaknesses;
  END IF;

  -- Check if feedback column exists (old schema)
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'interview_feedback' 
    AND column_name = 'feedback'
  ) THEN
    -- Rename feedback to overall_feedback
    ALTER TABLE interview_feedback RENAME COLUMN feedback TO overall_feedback;
  END IF;

  -- Add tips column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'interview_feedback' 
    AND column_name = 'tips'
  ) THEN
    ALTER TABLE interview_feedback ADD COLUMN tips TEXT[] DEFAULT '{}';
  END IF;

  -- Remove overall_score column if it exists (not needed in current schema)
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'interview_feedback' 
    AND column_name = 'overall_score'
  ) THEN
    ALTER TABLE interview_feedback DROP COLUMN overall_score;
  END IF;

END $$;

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';
