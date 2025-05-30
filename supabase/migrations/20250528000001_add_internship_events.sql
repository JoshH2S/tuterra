-- Create internship_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.internship_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.internship_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_internship_events_session_id ON public.internship_events(session_id);
CREATE INDEX IF NOT EXISTS idx_internship_events_date ON public.internship_events(date);

-- Enable RLS (Row Level Security)
ALTER TABLE public.internship_events ENABLE ROW LEVEL SECURITY;

-- Define RLS policies
CREATE POLICY "Users can view events for their internship sessions"
    ON public.internship_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.internship_sessions
            WHERE public.internship_sessions.id = session_id
            AND public.internship_sessions.user_id = auth.uid()
        )
    );

-- Grant permissions to authenticated users
GRANT SELECT ON public.internship_events TO authenticated; 