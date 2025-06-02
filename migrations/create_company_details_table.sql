-- Create the internship_company_details table
CREATE TABLE IF NOT EXISTS internship_company_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    description TEXT,
    mission TEXT,
    vision TEXT,
    values JSONB,
    founded_year INTEGER,
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE internship_company_details ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users who own the session
CREATE POLICY "Users can view company details for their sessions"
ON internship_company_details
FOR SELECT
TO authenticated
USING (
    session_id IN (
        SELECT id FROM internship_sessions 
        WHERE user_id = auth.uid()
    )
);

-- Allow insert/update access to authenticated users who own the session
CREATE POLICY "Users can insert company details for their sessions"
ON internship_company_details
FOR INSERT
TO authenticated
WITH CHECK (
    session_id IN (
        SELECT id FROM internship_sessions 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update company details for their sessions"
ON internship_company_details
FOR UPDATE
TO authenticated
USING (
    session_id IN (
        SELECT id FROM internship_sessions 
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    session_id IN (
        SELECT id FROM internship_sessions 
        WHERE user_id = auth.uid()
    )
);

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_internship_company_details_updated_at
    BEFORE UPDATE ON internship_company_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 