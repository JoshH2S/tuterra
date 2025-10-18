-- Create table for storing career portfolio data including reflection essay
CREATE TABLE IF NOT EXISTS public.internship_portfolio_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.internship_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_essay TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of session and user (one portfolio per internship)
  CONSTRAINT unique_session_user_portfolio UNIQUE (session_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_data_session_user 
ON public.internship_portfolio_data(session_id, user_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_data_updated 
ON public.internship_portfolio_data(updated_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.internship_portfolio_data ENABLE ROW LEVEL SECURITY;

-- Users can only access their own portfolio data
CREATE POLICY "Users can manage their own portfolio data"
ON public.internship_portfolio_data
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON public.internship_portfolio_data TO authenticated;
GRANT ALL ON public.internship_portfolio_data TO service_role;

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_portfolio_data_updated_at 
BEFORE UPDATE ON public.internship_portfolio_data 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
