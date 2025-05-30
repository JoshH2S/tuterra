-- Create the user_activity_streaks table to store user activity streak information
CREATE TABLE IF NOT EXISTS public.user_activity_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    streak_start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT user_activity_streaks_user_id_key UNIQUE (user_id)
);

-- Add indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_activity_streaks_user_id ON public.user_activity_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_streaks_last_active_date ON public.user_activity_streaks(last_active_date);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_activity_streaks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own streaks
CREATE POLICY "Users can view their own activity streaks" 
    ON public.user_activity_streaks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to update only their own streaks
CREATE POLICY "Users can update their own activity streaks" 
    ON public.user_activity_streaks
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own streaks
CREATE POLICY "Users can insert their own activity streaks" 
    ON public.user_activity_streaks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add type definition to database types file
COMMENT ON TABLE public.user_activity_streaks IS 'Table to track user activity streaks for virtual internships'; 