-- Check if the table exists
DO $$ 
BEGIN
  -- Add new columns to internship_resources if they don't exist
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_resources'
  ) THEN
    -- Add new columns if they don't exist
    BEGIN
      ALTER TABLE internship_resources 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS content TEXT;
    EXCEPTION
      WHEN duplicate_column THEN
        -- Do nothing, column already exists
    END;
  END IF;

  -- Create internship_company_details table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'internship_company_details'
  ) THEN
    CREATE TABLE internship_company_details (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID NOT NULL REFERENCES internship_sessions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      description TEXT,
      mission TEXT,
      vision TEXT,
      values JSONB,
      founded_year TEXT,
      size TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create index for performance
    CREATE INDEX idx_company_details_session_id ON internship_company_details(session_id);

    -- Add RLS policies
    ALTER TABLE internship_company_details ENABLE ROW LEVEL SECURITY;

    -- Allow users to view company details for their own sessions
    CREATE POLICY "Users can view their company details" 
      ON internship_company_details 
      FOR SELECT 
      USING (
        session_id IN (
          SELECT id FROM internship_sessions WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$; 