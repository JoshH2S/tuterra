-- Create a function to update activity streak
CREATE OR REPLACE FUNCTION update_activity_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_streak RECORD;
  days_diff INTEGER;
BEGIN
  -- Get the user's current streak record
  SELECT * INTO last_streak FROM user_activity_streaks 
  WHERE user_id = NEW.user_id;
  
  IF FOUND THEN
    -- Calculate days between last activity and now
    days_diff := (NEW.last_active_date - last_streak.last_active_date);
    
    -- If exactly 1 day since last activity, increment streak
    IF days_diff = 1 THEN
      UPDATE user_activity_streaks
      SET 
        current_streak = last_streak.current_streak + 1,
        longest_streak = GREATEST(last_streak.longest_streak, last_streak.current_streak + 1),
        last_active_date = NEW.last_active_date,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
    -- If same day, don't change streak
    ELSIF days_diff = 0 THEN
      UPDATE user_activity_streaks
      SET updated_at = NOW()
      WHERE user_id = NEW.user_id;
    -- If more than 1 day, reset streak to 1
    ELSE
      UPDATE user_activity_streaks
      SET 
        current_streak = 1,
        last_active_date = NEW.last_active_date,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  ELSE
    -- First activity for this user
    INSERT INTO user_activity_streaks (
      user_id, 
      last_active_date, 
      current_streak, 
      longest_streak
    ) VALUES (
      NEW.user_id, 
      NEW.last_active_date, 
      1, 
      1
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update streaks on inserts and updates
CREATE TRIGGER trigger_update_activity_streak
BEFORE INSERT OR UPDATE ON user_activity_streaks
FOR EACH ROW
EXECUTE FUNCTION update_activity_streak();

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
CREATE TRIGGER trigger_check_achievements
AFTER INSERT OR UPDATE ON internship_task_submissions
FOR EACH ROW
EXECUTE FUNCTION check_and_award_achievements(); 