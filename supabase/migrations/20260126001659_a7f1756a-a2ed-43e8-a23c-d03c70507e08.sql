-- =============================================
-- COURSE ENGINE: Database Schema Migration
-- =============================================

-- Step 1: Create enum for step types
CREATE TYPE public.course_step_type AS ENUM (
  'teach',
  'prompt', 
  'quiz',
  'checkpoint',
  'reflection'
);

-- Step 2: Create enum for course status
CREATE TYPE public.course_engine_status AS ENUM (
  'draft',
  'generating',
  'active',
  'completed',
  'archived'
);

-- Step 3: Create enum for course level
CREATE TYPE public.course_level AS ENUM (
  'beginner',
  'intermediate', 
  'advanced'
);

-- Step 4: Create generated_courses table (separate from existing courses table)
CREATE TABLE public.generated_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  goal TEXT,
  title TEXT NOT NULL,
  description TEXT,
  level public.course_level NOT NULL DEFAULT 'beginner',
  pace_weeks INTEGER NOT NULL DEFAULT 4,
  format_preferences JSONB DEFAULT '{}',
  learning_objectives JSONB DEFAULT '[]',
  status public.course_engine_status NOT NULL DEFAULT 'draft',
  context_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 5: Create course_modules table
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.generated_courses(id) ON DELETE CASCADE,
  module_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  estimated_minutes INTEGER DEFAULT 30,
  checkpoints_schema JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, module_index)
);

-- Step 6: Create module_steps table
CREATE TABLE public.module_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  step_type public.course_step_type NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  rubric JSONB,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(module_id, step_index)
);

-- Step 7: Create course_progress table
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.generated_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_module_id UUID REFERENCES public.course_modules(id),
  current_step_id UUID REFERENCES public.module_steps(id),
  module_completion JSONB DEFAULT '{}',
  total_steps_completed INTEGER DEFAULT 0,
  total_checkpoints_passed INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Step 8: Create step_submissions table
CREATE TABLE public.step_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES public.module_steps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.generated_courses(id) ON DELETE CASCADE,
  submission JSONB NOT NULL,
  ai_feedback JSONB,
  score NUMERIC,
  is_passing BOOLEAN,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 9: Create indexes for performance
CREATE INDEX idx_generated_courses_user_id ON public.generated_courses(user_id);
CREATE INDEX idx_generated_courses_status ON public.generated_courses(status);
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_module_steps_module_id ON public.module_steps(module_id);
CREATE INDEX idx_course_progress_user_course ON public.course_progress(user_id, course_id);
CREATE INDEX idx_step_submissions_step_user ON public.step_submissions(step_id, user_id);
CREATE INDEX idx_step_submissions_course_id ON public.step_submissions(course_id);

-- Step 10: Enable RLS on all tables
ALTER TABLE public.generated_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_submissions ENABLE ROW LEVEL SECURITY;

-- Step 11: RLS Policies for generated_courses
CREATE POLICY "Users can view their own courses"
ON public.generated_courses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own courses"
ON public.generated_courses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
ON public.generated_courses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
ON public.generated_courses FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 12: RLS Policies for course_modules (access via course ownership)
CREATE POLICY "Users can view modules of their courses"
ON public.course_modules FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_courses 
    WHERE id = course_modules.course_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert modules for their courses"
ON public.course_modules FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_courses 
    WHERE id = course_modules.course_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update modules of their courses"
ON public.course_modules FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_courses 
    WHERE id = course_modules.course_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete modules of their courses"
ON public.course_modules FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_courses 
    WHERE id = course_modules.course_id 
    AND user_id = auth.uid()
  )
);

-- Step 13: RLS Policies for module_steps (access via module -> course ownership)
CREATE POLICY "Users can view steps of their modules"
ON public.module_steps FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.course_modules cm
    JOIN public.generated_courses gc ON gc.id = cm.course_id
    WHERE cm.id = module_steps.module_id 
    AND gc.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert steps for their modules"
ON public.module_steps FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.course_modules cm
    JOIN public.generated_courses gc ON gc.id = cm.course_id
    WHERE cm.id = module_steps.module_id 
    AND gc.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update steps of their modules"
ON public.module_steps FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.course_modules cm
    JOIN public.generated_courses gc ON gc.id = cm.course_id
    WHERE cm.id = module_steps.module_id 
    AND gc.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete steps of their modules"
ON public.module_steps FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.course_modules cm
    JOIN public.generated_courses gc ON gc.id = cm.course_id
    WHERE cm.id = module_steps.module_id 
    AND gc.user_id = auth.uid()
  )
);

-- Step 14: RLS Policies for course_progress
CREATE POLICY "Users can view their own progress"
ON public.course_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
ON public.course_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.course_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.course_progress FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 15: RLS Policies for step_submissions
CREATE POLICY "Users can view their own submissions"
ON public.step_submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
ON public.step_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
ON public.step_submissions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Step 16: Create trigger for updated_at on generated_courses
CREATE TRIGGER update_generated_courses_updated_at
BEFORE UPDATE ON public.generated_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 17: Create trigger for updated_at on course_modules
CREATE TRIGGER update_course_modules_updated_at
BEFORE UPDATE ON public.course_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 18: Create trigger for updated_at on course_progress
CREATE TRIGGER update_course_progress_updated_at
BEFORE UPDATE ON public.course_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();