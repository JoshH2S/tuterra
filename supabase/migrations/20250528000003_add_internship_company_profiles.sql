-- Create the internship_company_profiles table
CREATE TABLE IF NOT EXISTS public.internship_company_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.internship_sessions(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    company_overview TEXT,
    company_mission TEXT,
    team_structure TEXT,
    company_values TEXT,
    clients_or_products TEXT,
    headquarters_location TEXT,
    company_logo_url TEXT,
    supervisor_name TEXT,
    background_story TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT internship_company_profiles_session_id_key UNIQUE (session_id)
);

-- Add index for faster lookups
CREATE INDEX idx_internship_company_profiles_session_id ON public.internship_company_profiles(session_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.internship_company_profiles ENABLE ROW LEVEL SECURITY;

-- Define RLS policy for viewing company profiles
CREATE POLICY "Users can view company profiles for their internship sessions"
    ON public.internship_company_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.internship_sessions
            WHERE internship_sessions.id = session_id
            AND internship_sessions.user_id = auth.uid()
        )
    );

-- Create policy for admin/service roles to manage company profiles
CREATE POLICY "Service role can manage company profiles" 
    ON public.internship_company_profiles
    USING (auth.role() = 'service_role');

-- Grant permissions to authenticated users
GRANT SELECT ON public.internship_company_profiles TO authenticated; 