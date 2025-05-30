-- Add resources column to internship_task_details table
ALTER TABLE public.internship_task_details 
ADD COLUMN IF NOT EXISTS resources TEXT;

-- Update RLS policies to include the new column
ALTER POLICY "Users can view task details for their internship sessions" ON public.internship_task_details 
USING (EXISTS (
    SELECT 1 FROM public.internship_tasks
    JOIN public.internship_sessions ON internship_sessions.id = internship_tasks.session_id
    WHERE internship_tasks.id = internship_task_details.task_id
    AND internship_sessions.user_id = auth.uid()
));

-- Grant permissions
GRANT ALL ON public.internship_task_details TO authenticated; 