-- Create a table to track virtual internship login sessions
CREATE TABLE IF NOT EXISTS public.virtual_internship_logins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.internship_sessions(id) ON DELETE CASCADE,
    login_date DATE NOT NULL,
    login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT virtual_internship_logins_user_date_unique UNIQUE (user_id, login_date)
);

-- Create indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_virtual_internship_logins_user_id ON public.virtual_internship_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_internship_logins_date ON public.virtual_internship_logins(login_date);

-- Enable RLS
ALTER TABLE public.virtual_internship_logins ENABLE ROW LEVEL SECURITY;

-- Create policies for virtual_internship_logins
CREATE POLICY "Users can view their own login records" 
    ON public.virtual_internship_logins
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login records" 
    ON public.virtual_internship_logins
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT ON public.virtual_internship_logins TO authenticated;

-- Remove the old problematic trigger
DROP TRIGGER IF EXISTS trigger_update_activity_streak ON user_activity_streaks;

-- Create a function to calculate and update activity streaks based on actual logins
CREATE OR REPLACE FUNCTION update_virtual_internship_streak(p_user_id UUID, p_session_id UUID DEFAULT NULL, p_user_date DATE DEFAULT NULL)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, last_active_date DATE) AS $$
DECLARE
    today_date DATE := COALESCE(p_user_date, CURRENT_DATE);
    existing_streak RECORD;
    new_current_streak INTEGER := 1;
    new_longest_streak INTEGER := 1;
    days_since_last INTEGER;
BEGIN
    -- Record today's login (ignore if already exists for today)
    INSERT INTO public.virtual_internship_logins (user_id, session_id, login_date)
    VALUES (p_user_id, p_session_id, today_date)
    ON CONFLICT (user_id, login_date) DO NOTHING;
    
    -- Get existing streak data
    SELECT * INTO existing_streak 
    FROM public.user_activity_streaks 
    WHERE user_id = p_user_id;
  
    IF existing_streak IS NOT NULL THEN
        -- Calculate days since last recorded activity
        IF existing_streak.last_active_date IS NOT NULL THEN
            days_since_last := today_date - existing_streak.last_active_date;
    
            -- If exactly 1 day since last activity, continue streak
            IF days_since_last = 1 THEN
                new_current_streak := existing_streak.current_streak + 1;
                new_longest_streak := GREATEST(existing_streak.longest_streak, new_current_streak);
            -- If same day, no change needed (but shouldn't happen due to our insert logic)
            ELSIF days_since_last = 0 THEN
                new_current_streak := existing_streak.current_streak;
                new_longest_streak := existing_streak.longest_streak;
            -- If more than 1 day gap, reset streak
            ELSE
                new_current_streak := 1;
                new_longest_streak := existing_streak.longest_streak;
            END IF;
        ELSE
            -- No previous date, this is day 1
            new_current_streak := 1;
            new_longest_streak := GREATEST(existing_streak.longest_streak, 1);
        END IF;
        
        -- Update existing record
        UPDATE public.user_activity_streaks
        SET 
            current_streak = new_current_streak,
            longest_streak = new_longest_streak,
            last_active_date = today_date,
            streak_start_date = CASE 
                WHEN new_current_streak = 1 THEN today_date
                ELSE COALESCE(streak_start_date, today_date)
            END,
        updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSE
        -- Create new streak record
        INSERT INTO public.user_activity_streaks (
            user_id, 
            current_streak, 
            longest_streak, 
            last_active_date,
            streak_start_date
        ) VALUES (
            p_user_id, 
            1, 
            1, 
            today_date,
            today_date
        );
        
        new_current_streak := 1;
        new_longest_streak := 1;
    END IF;
    
    -- Return the updated values
    RETURN QUERY SELECT new_current_streak, new_longest_streak, today_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to validate and recalculate streaks based on actual login history
CREATE OR REPLACE FUNCTION recalculate_virtual_internship_streak(p_user_id UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, last_active_date DATE) AS $$
DECLARE
    login_record RECORD;
    current_streak_count INTEGER := 0;
    max_streak_count INTEGER := 0;
    temp_streak INTEGER := 0;
    last_date DATE := NULL;
    previous_date DATE := NULL;
    final_last_date DATE := NULL;
BEGIN
    -- Get all login dates for the user, ordered by date DESC
    FOR login_record IN 
        SELECT DISTINCT login_date 
        FROM public.virtual_internship_logins 
        WHERE user_id = p_user_id 
        ORDER BY login_date DESC
    LOOP
        IF last_date IS NULL THEN
            -- First record (most recent)
            last_date := login_record.login_date;
            final_last_date := last_date;
            temp_streak := 1;
            
            -- Only count as current streak if login was today or yesterday
            IF last_date >= CURRENT_DATE - INTERVAL '1 day' THEN
                current_streak_count := 1;
            ELSE
                current_streak_count := 0;
            END IF;
        ELSE
            -- Check if this date is consecutive with previous
            IF last_date - login_record.login_date = 1 THEN
                temp_streak := temp_streak + 1;
                
                -- Update current streak only if we're still in the "current" period
                IF current_streak_count > 0 THEN
                    current_streak_count := temp_streak;
    END IF;
  ELSE
                -- Streak broken, update max and reset temp
                max_streak_count := GREATEST(max_streak_count, temp_streak);
                temp_streak := 1;
                
                -- Current streak is broken if we had one
                IF current_streak_count > 0 THEN
                    current_streak_count := current_streak_count; -- Keep the value we had
                END IF;
            END IF;
        END IF;
        
        previous_date := last_date;
        last_date := login_record.login_date;
    END LOOP;
    
    -- Don't forget the last streak
    max_streak_count := GREATEST(max_streak_count, temp_streak);
    
    -- If current_streak_count is still 0 but we have a recent login, set it
    IF current_streak_count = 0 AND final_last_date >= CURRENT_DATE - INTERVAL '1 day' THEN
        current_streak_count := 1;
    END IF;
    
    -- Ensure longest_streak is at least as long as current_streak
    max_streak_count := GREATEST(max_streak_count, current_streak_count);
    
    -- Update the user_activity_streaks table
    INSERT INTO public.user_activity_streaks (
      user_id, 
        current_streak, 
        longest_streak, 
      last_active_date, 
        streak_start_date,
        updated_at
    ) VALUES (
        p_user_id, 
        current_streak_count, 
        max_streak_count, 
        final_last_date,
        final_last_date,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        last_active_date = EXCLUDED.last_active_date,
        streak_start_date = CASE 
            WHEN EXCLUDED.current_streak = 1 THEN EXCLUDED.last_active_date
            ELSE user_activity_streaks.streak_start_date
        END,
        updated_at = NOW();
    
    -- Return the calculated values
    RETURN QUERY SELECT current_streak_count, max_streak_count, final_last_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to award achievements when certain conditions are met
CREATE OR REPLACE FUNCTION check_and_award_achievements()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the task was completed ahead of schedule
  IF NEW.status = 'completed' AND EXISTS (
    SELECT 1 FROM internship_tasks 
    WHERE id = NEW.task_id AND due_date > NOW()
  ) THEN
    -- Award the fast_learner achievement if not already awarded
    INSERT INTO user_achievements (
      user_id,
      achievement_key,
      achievement_type,
      metadata
    ) 
    SELECT 
      NEW.user_id,
      'fast_learner',
      'internship',
      jsonb_build_object('task_id', NEW.task_id)
    WHERE NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = NEW.user_id AND achievement_key = 'fast_learner'
    );
  END IF;
  
  -- Check for team player achievement (5+ submissions)
  IF (
    SELECT COUNT(*) FROM internship_task_submissions 
    WHERE user_id = NEW.user_id
  ) >= 5 THEN
    -- Award the team_player achievement if not already awarded
    INSERT INTO user_achievements (
      user_id,
      achievement_key,
      achievement_type,
      metadata
    ) 
    SELECT 
      NEW.user_id,
      'team_player',
      'internship',
      jsonb_build_object('completed_count', (
        SELECT COUNT(*) FROM internship_task_submissions 
        WHERE user_id = NEW.user_id
      ))
    WHERE NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = NEW.user_id AND achievement_key = 'team_player'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to check for achievements when task submissions are created
DROP TRIGGER IF EXISTS trigger_check_achievements ON internship_task_submissions;
CREATE TRIGGER trigger_check_achievements
AFTER INSERT OR UPDATE ON internship_task_submissions
FOR EACH ROW
EXECUTE FUNCTION check_and_award_achievements(); 