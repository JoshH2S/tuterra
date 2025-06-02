-- Comprehensive Company Profile Migration for Virtual Internship Platform
-- This adds all fields needed for an immersive, professional company experience

-- Add new columns to internship_company_profiles table
ALTER TABLE internship_company_profiles 
ADD COLUMN IF NOT EXISTS company_vision TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS founded_year TEXT,
ADD COLUMN IF NOT EXISTS ceo_name TEXT,
ADD COLUMN IF NOT EXISTS ceo_bio TEXT,
ADD COLUMN IF NOT EXISTS company_tagline TEXT,
ADD COLUMN IF NOT EXISTS departments TEXT[], -- Array of departments
ADD COLUMN IF NOT EXISTS team_members JSONB, -- JSON array of team member objects
ADD COLUMN IF NOT EXISTS tools_technologies TEXT[], -- Array of tools/technologies
ADD COLUMN IF NOT EXISTS target_market TEXT,
ADD COLUMN IF NOT EXISTS notable_clients TEXT[], -- Array of client names
ADD COLUMN IF NOT EXISTS intern_department TEXT, -- Specific department intern is placed in
ADD COLUMN IF NOT EXISTS sample_projects TEXT[], -- Array of project types
ADD COLUMN IF NOT EXISTS intern_expectations TEXT[]; -- Array of expectations

-- Make sure existing nullable fields are properly handled
ALTER TABLE internship_company_profiles 
ALTER COLUMN company_overview SET NOT NULL,
ALTER COLUMN company_mission SET NOT NULL,
ALTER COLUMN team_structure SET NOT NULL,
ALTER COLUMN company_values SET NOT NULL,
ALTER COLUMN clients_or_products SET NOT NULL,
ALTER COLUMN headquarters_location SET NOT NULL,
ALTER COLUMN supervisor_name SET NOT NULL,
ALTER COLUMN background_story SET NOT NULL;

-- Add default values for existing records that might have null values
UPDATE internship_company_profiles 
SET 
  company_overview = COALESCE(company_overview, 'A leading company in the industry.'),
  company_mission = COALESCE(company_mission, 'To deliver excellence and innovation.'),
  team_structure = COALESCE(team_structure, 'Cross-functional teams'),
  company_values = COALESCE(company_values, 'Innovation, Integrity, Excellence'),
  clients_or_products = COALESCE(clients_or_products, 'Various industry clients'),
  headquarters_location = COALESCE(headquarters_location, 'New York, NY'),
  supervisor_name = COALESCE(supervisor_name, 'Alex Johnson'),
  background_story = COALESCE(background_story, 'Founded to make a positive impact in the industry.')
WHERE company_overview IS NULL 
   OR company_mission IS NULL 
   OR team_structure IS NULL 
   OR company_values IS NULL 
   OR clients_or_products IS NULL 
   OR headquarters_location IS NULL 
   OR supervisor_name IS NULL 
   OR background_story IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN internship_company_profiles.company_vision IS 'Long-term aspirations and vision statement';
COMMENT ON COLUMN internship_company_profiles.company_size IS 'Number of employees (e.g., "100-500 employees")';
COMMENT ON COLUMN internship_company_profiles.founded_year IS 'Year the company was founded';
COMMENT ON COLUMN internship_company_profiles.ceo_name IS 'Name of the CEO/Founder (fictional)';
COMMENT ON COLUMN internship_company_profiles.ceo_bio IS 'Brief bio of the CEO/Founder';
COMMENT ON COLUMN internship_company_profiles.company_tagline IS 'Company motto or tagline';
COMMENT ON COLUMN internship_company_profiles.departments IS 'Array of key departments/divisions';
COMMENT ON COLUMN internship_company_profiles.team_members IS 'JSON array of team member objects with name, role, email';
COMMENT ON COLUMN internship_company_profiles.tools_technologies IS 'Array of tools and technologies used';
COMMENT ON COLUMN internship_company_profiles.target_market IS 'Description of target market or audience';
COMMENT ON COLUMN internship_company_profiles.notable_clients IS 'Array of notable client names (fictional)';
COMMENT ON COLUMN internship_company_profiles.intern_department IS 'Specific department where intern is placed';
COMMENT ON COLUMN internship_company_profiles.sample_projects IS 'Array of sample project types intern may work on';
COMMENT ON COLUMN internship_company_profiles.intern_expectations IS 'Array of expectations from interns';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_company_profiles_industry ON internship_company_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_company_profiles_founded_year ON internship_company_profiles(founded_year);

-- Update RLS policies if needed (assuming they exist)
-- This ensures users can only see their own company profiles
DROP POLICY IF EXISTS "Users can view own company profiles" ON internship_company_profiles;
CREATE POLICY "Users can view own company profiles" ON internship_company_profiles
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM internship_sessions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own company profiles" ON internship_company_profiles;
CREATE POLICY "Users can insert own company profiles" ON internship_company_profiles
    FOR INSERT WITH CHECK (
        session_id IN (
            SELECT id FROM internship_sessions 
            WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own company profiles" ON internship_company_profiles;
CREATE POLICY "Users can update own company profiles" ON internship_company_profiles
    FOR UPDATE USING (
        session_id IN (
            SELECT id FROM internship_sessions 
            WHERE user_id = auth.uid()
        )
    );

-- Enable RLS if not already enabled
ALTER TABLE internship_company_profiles ENABLE ROW LEVEL SECURITY; 