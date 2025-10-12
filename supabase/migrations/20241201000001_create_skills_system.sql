-- Skills-based Performance Tracking System
-- MVP Implementation for Tuterra Virtual Internships

-- 1. Skills catalog table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL, -- 'technical', 'communication', 'analysis', 'creative', 'leadership'
  max_level INTEGER DEFAULT 100,
  xp_per_level INTEGER DEFAULT 100, -- XP needed to advance each level
  icon TEXT, -- Icon name for UI
  color TEXT DEFAULT '#3B82F6', -- Hex color for skill theme
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Task-to-Skills mapping table
CREATE TABLE IF NOT EXISTS public.task_skill_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.internship_tasks(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  xp_reward INTEGER DEFAULT 15, -- Base XP for completing this task with this skill
  proficiency_weight DECIMAL(3,2) DEFAULT 1.0, -- How much this task demonstrates the skill (0.1-3.0)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, skill_id)
);

-- 3. User skill progress tracking
CREATE TABLE IF NOT EXISTS public.user_skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  current_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  total_submissions INTEGER DEFAULT 0, -- Count of submissions that contributed to this skill
  best_submission_id UUID, -- Reference to best example submission
  evidence_submissions UUID[] DEFAULT '{}', -- Array of submission IDs as evidence
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- 4. Extend existing task submissions table for skills data
ALTER TABLE public.internship_task_submissions 
ADD COLUMN IF NOT EXISTS skills_earned JSONB DEFAULT '{}', -- {skill_id: {xp_earned: 15, proficiency_score: 7.5}}
ADD COLUMN IF NOT EXISTS skill_analysis JSONB DEFAULT '{}', -- Detailed AI analysis of skills demonstrated
ADD COLUMN IF NOT EXISTS is_featured_evidence BOOLEAN DEFAULT FALSE; -- Whether this submission is showcased as evidence

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_task_skill_mapping_task_id ON public.task_skill_mapping(task_id);
CREATE INDEX IF NOT EXISTS idx_task_skill_mapping_skill_id ON public.task_skill_mapping(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_user_id ON public.user_skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_skill_id ON public.user_skill_progress(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_level ON public.user_skill_progress(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_skills_earned ON public.internship_task_submissions USING GIN(skills_earned);

-- Enable Row Level Security
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_skill_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Skills are readable by all authenticated users
CREATE POLICY "Skills are publicly readable" ON public.skills
  FOR SELECT USING (auth.role() = 'authenticated');

-- Task skill mappings are readable by users who can see the task
CREATE POLICY "Users can view task skill mappings for their internships" ON public.task_skill_mapping
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.internship_tasks
      JOIN public.internship_sessions ON internship_tasks.session_id = internship_sessions.id
      WHERE internship_tasks.id = task_skill_mapping.task_id
      AND internship_sessions.user_id = auth.uid()
    )
  );

-- Users can only view and update their own skill progress
CREATE POLICY "Users can view their own skill progress" ON public.user_skill_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill progress" ON public.user_skill_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert skill progress" ON public.user_skill_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Service role can manage all tables
CREATE POLICY "Service role can manage skills" ON public.skills
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage task skill mappings" ON public.task_skill_mapping
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user skill progress" ON public.user_skill_progress
  USING (auth.role() = 'service_role');

-- Insert initial skills data
INSERT INTO public.skills (name, description, category, icon, color) VALUES
  ('Technical Writing', 'Clear, concise, and professional written communication for technical topics', 'communication', 'FileText', '#10B981'),
  ('Data Analysis', 'Collecting, processing, and interpreting data to drive insights and decisions', 'analysis', 'BarChart', '#3B82F6'),
  ('SQL Querying', 'Writing efficient database queries to extract and manipulate data', 'technical', 'Database', '#8B5CF6'),
  ('Project Management', 'Planning, organizing, and executing projects from start to finish', 'leadership', 'CheckCircle', '#F59E0B'),
  ('Problem Solving', 'Identifying issues, analyzing root causes, and developing effective solutions', 'analysis', 'Lightbulb', '#EF4444'),
  ('Client Communication', 'Building relationships and communicating effectively with clients and stakeholders', 'communication', 'Users', '#06B6D4'),
  ('Creative Design', 'Developing innovative and visually appealing solutions and presentations', 'creative', 'Palette', '#EC4899'),
  ('Research & Investigation', 'Gathering, evaluating, and synthesizing information from multiple sources', 'analysis', 'Search', '#84CC16'),
  ('Campaign Strategy', 'Planning and executing marketing campaigns to achieve business objectives', 'creative', 'Target', '#F97316'),
  ('Financial Analysis', 'Analyzing financial data and creating reports to support business decisions', 'analysis', 'DollarSign', '#059669')
ON CONFLICT (name) DO NOTHING;

-- Create function to calculate user level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp INTEGER, xp_per_level INTEGER DEFAULT 100)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(xp / xp_per_level) + 1);
END;
$$ LANGUAGE plpgsql;

-- Create function to update user skill progress
CREATE OR REPLACE FUNCTION update_user_skill_progress(
  p_user_id UUID,
  p_skill_id UUID,
  p_xp_gained INTEGER,
  p_submission_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  skill_record RECORD;
  current_progress RECORD;
  new_level INTEGER;
BEGIN
  -- Get skill information
  SELECT * INTO skill_record FROM public.skills WHERE id = p_skill_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Skill not found: %', p_skill_id;
  END IF;

  -- Get or create current progress
  SELECT * INTO current_progress 
  FROM public.user_skill_progress 
  WHERE user_id = p_user_id AND skill_id = p_skill_id;

  IF NOT FOUND THEN
    -- Create new progress record
    INSERT INTO public.user_skill_progress (
      user_id, 
      skill_id, 
      current_xp, 
      current_level, 
      total_submissions,
      evidence_submissions,
      best_submission_id
    ) VALUES (
      p_user_id,
      p_skill_id,
      p_xp_gained,
      calculate_level_from_xp(p_xp_gained, skill_record.xp_per_level),
      1,
      CASE WHEN p_submission_id IS NOT NULL THEN ARRAY[p_submission_id] ELSE '{}' END,
      p_submission_id
    );
  ELSE
    -- Update existing progress
    new_level := calculate_level_from_xp(current_progress.current_xp + p_xp_gained, skill_record.xp_per_level);
    
    UPDATE public.user_skill_progress SET
      current_xp = current_progress.current_xp + p_xp_gained,
      current_level = new_level,
      total_submissions = current_progress.total_submissions + 1,
      evidence_submissions = CASE 
        WHEN p_submission_id IS NOT NULL AND NOT (p_submission_id = ANY(current_progress.evidence_submissions))
        THEN array_append(current_progress.evidence_submissions, p_submission_id)
        ELSE current_progress.evidence_submissions
      END,
      best_submission_id = CASE
        WHEN current_progress.best_submission_id IS NULL THEN p_submission_id
        ELSE current_progress.best_submission_id
      END,
      last_activity = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id AND skill_id = p_skill_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.skills TO authenticated;
GRANT SELECT ON public.task_skill_mapping TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_skill_progress TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_level_from_xp TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_skill_progress TO service_role;
