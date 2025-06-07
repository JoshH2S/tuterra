-- Add profile status tracking to internship_company_profiles table
ALTER TABLE internship_company_profiles 
ADD COLUMN IF NOT EXISTS profile_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create an index for efficient querying by session_id and status
CREATE INDEX IF NOT EXISTS idx_company_profiles_session_status 
ON internship_company_profiles(session_id, profile_status);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_company_profiles_updated_at ON internship_company_profiles;
CREATE TRIGGER update_company_profiles_updated_at
    BEFORE UPDATE ON internship_company_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 