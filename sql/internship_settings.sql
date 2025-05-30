-- Create the internship_settings table to store user customizations for internships
CREATE TABLE IF NOT EXISTS public.internship_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.internship_sessions(id) ON DELETE CASCADE,
    banner_url TEXT,
    theme VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_internship_settings_session_id ON public.internship_settings(session_id);

-- Add RLS policies
ALTER TABLE public.internship_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own settings
CREATE POLICY "Users can view their own internship settings" ON public.internship_settings
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.internship_sessions WHERE id = session_id
        )
    );

-- Allow users to insert their own settings
CREATE POLICY "Users can insert their own internship settings" ON public.internship_settings
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.internship_sessions WHERE id = session_id
        )
    );

-- Allow users to update their own settings
CREATE POLICY "Users can update their own internship settings" ON public.internship_settings
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.internship_sessions WHERE id = session_id
        )
    );

-- Create storage bucket for banner images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('internship-assets', 'internship-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for internship assets
CREATE POLICY "Public access to internship assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'internship-assets');

CREATE POLICY "Users can upload internship assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'internship-assets' AND
    auth.uid() IS NOT NULL
);

COMMENT ON TABLE public.internship_settings IS 'Stores user customizations for virtual internships, such as banner images and themes'; 