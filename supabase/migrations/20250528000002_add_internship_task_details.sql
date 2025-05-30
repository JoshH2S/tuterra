-- Create the internship_task_details table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.internship_task_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.internship_tasks(id) ON DELETE CASCADE,
    background TEXT NOT NULL,
    instructions TEXT,
    deliverables TEXT,
    success_criteria TEXT,
    resources TEXT,
    generation_status TEXT,
    generated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT internship_task_details_task_id_key UNIQUE (task_id)
);

-- Add index for faster lookups
CREATE INDEX idx_internship_task_details_task_id ON public.internship_task_details(task_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.internship_task_details ENABLE ROW LEVEL SECURITY;

-- Define RLS policy for viewing task details
CREATE POLICY "Users can view task details for their internship sessions"
    ON public.internship_task_details
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.internship_tasks
            JOIN public.internship_sessions ON internship_tasks.session_id = internship_sessions.id
            WHERE internship_tasks.id = task_id
            AND internship_sessions.user_id = auth.uid()
        )
    );

-- Create policy for admin/service roles to manage task details
CREATE POLICY "Service role can manage task details" 
    ON public.internship_task_details
    USING (auth.role() = 'service_role');

-- Grant permissions to authenticated users
GRANT SELECT ON public.internship_task_details TO authenticated; 