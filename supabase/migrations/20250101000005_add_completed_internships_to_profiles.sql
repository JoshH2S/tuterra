-- Add completed_internships column to profiles table
-- This column is referenced by the internship completion trigger

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completed_internships INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.completed_internships IS 'Number of internships completed by the user';

-- Create index for performance if needed for queries
CREATE INDEX IF NOT EXISTS idx_profiles_completed_internships 
ON public.profiles(completed_internships) 
WHERE completed_internships > 0;
