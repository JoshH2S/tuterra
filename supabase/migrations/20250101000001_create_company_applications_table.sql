-- Create table for storing company applications in the final project
CREATE TABLE IF NOT EXISTS public.internship_company_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.internship_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  company_url TEXT,
  research_notes TEXT,
  cover_letter TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of session, user, and company
  CONSTRAINT unique_session_user_company UNIQUE (session_id, user_id, company_name)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_applications_session_user 
ON public.internship_company_applications(session_id, user_id);

CREATE INDEX IF NOT EXISTS idx_company_applications_updated 
ON public.internship_company_applications(updated_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.internship_company_applications ENABLE ROW LEVEL SECURITY;

-- Users can only access their own applications
CREATE POLICY "Users can manage their own company applications"
ON public.internship_company_applications
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.internship_company_applications TO authenticated;
GRANT ALL ON public.internship_company_applications TO service_role;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_applications_updated_at 
BEFORE UPDATE ON public.internship_company_applications 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
