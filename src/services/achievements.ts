import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, differenceInDays, subDays } from "date-fns";

// Types for achievements
export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at?: string;
  achievement_type: string;
}

export interface ActivityStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
}

// Fetch user's achievements
export async function fetchUserAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('user_achievement_details')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
  
  return data || [];
}

// Fetch user's activity streak
export async function fetchActivityStreak(userId: string): Promise<ActivityStreak | null> {
  const { data, error } = await supabase
    .from('user_activity_streaks')
    .select('current_streak, longest_streak, last_active_date')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching activity streak:', error);
    return null;
  }
  
  return data;
}

/**
 * Updates the user's activity streak when they access the platform
 * Creates a streak entry if one doesn't exist, and handles streak calculation
 * @param userId The user's ID
 */
export async function updateActivityStreak(userId: string): Promise<void> {
  if (!userId) return;
  
  try {
    console.log(`Updating activity streak for user ${userId}`);
    const today = new Date();
    const todayFormatted = format(today, 'yyyy-MM-dd');

    // First, try to get the existing streak record
    const { data: existingStreak, error: fetchError } = await supabase
      .from('user_activity_streaks')
      .select('id, current_streak, longest_streak, last_active_date, streak_start_date')
      .eq('user_id', userId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected for new users
      console.error('Error fetching activity streak:', fetchError);
      return;
    }

    // Calculate new streak values
    let currentStreak = 1; // Default for new users
    let longestStreak = 1; // Default for new users
    let streakStartDate = todayFormatted;

    if (existingStreak) {
      const lastActiveDate = existingStreak.last_active_date ? new Date(existingStreak.last_active_date) : null;
      
      if (lastActiveDate) {
        const daysSinceLastActive = differenceInDays(today, lastActiveDate);
        
        // If user was active yesterday, increment the streak
        if (daysSinceLastActive === 1) {
          currentStreak = existingStreak.current_streak + 1;
          streakStartDate = existingStreak.streak_start_date || todayFormatted;
          longestStreak = Math.max(currentStreak, existingStreak.longest_streak);
        }
        // If user is active again today, keep the streak the same
        else if (daysSinceLastActive === 0) {
          currentStreak = existingStreak.current_streak;
          streakStartDate = existingStreak.streak_start_date || todayFormatted;
          longestStreak = existingStreak.longest_streak;
          return; // No need to update if already logged today
        }
        // If user missed days, reset the streak
        else {
          currentStreak = 1;
          streakStartDate = todayFormatted;
          longestStreak = existingStreak.longest_streak;
        }
      }
    }

    // Upsert the streak record (update if exists, insert if not)
    const { error: upsertError } = await supabase
      .from('user_activity_streaks')
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: todayFormatted,
        streak_start_date: streakStartDate,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id' 
      });

    if (upsertError) {
      console.error('Error updating activity streak:', upsertError);
    } else {
      console.log(`Successfully updated streak for user ${userId}. Current streak: ${currentStreak}, Longest streak: ${longestStreak}`);
    }
  } catch (error) {
    console.error('Unexpected error updating activity streak:', error);
  }
}

// Check and award achievement if conditions are met
export async function checkAndAwardAchievement(
  userId: string, 
  achievementKey: string, 
  metadata: any = {}
): Promise<boolean> {
  // First check if user already has this achievement
  const { data: existingAchievement } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_key', achievementKey)
    .single();
  
  if (existingAchievement) {
    // User already has this achievement
    return false;
  }
  
  // Award the achievement
  const { error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_key: achievementKey,
      achievement_type: metadata.type || 'internship',
      metadata
    });
  
  if (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
  
  return true;
}

// Helper function to check specific achievement conditions
export async function checkTaskCompletionAchievements(
  userId: string, 
  taskId: string, 
  dueDate: string, 
  completionDate: string
): Promise<void> {
  // Check if task was completed ahead of schedule
  const dueDateTime = new Date(dueDate).getTime();
  const completionDateTime = new Date(completionDate).getTime();
  
  if (completionDateTime < dueDateTime) {
    // Task completed ahead of schedule, award 'fast_learner' achievement
    await checkAndAwardAchievement(userId, 'fast_learner', {
      task_id: taskId,
      days_early: Math.floor((dueDateTime - completionDateTime) / (1000 * 60 * 60 * 24))
    });
  }
}

// Check for team player achievement
export async function checkTeamPlayerAchievement(userId: string): Promise<void> {
  // Count collaborative tasks the user has participated in
  const { count, error } = await supabase
    .from('internship_task_submissions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('collaboration_rating', 10); // Assuming high collaboration rating means team project
  
  if (error) {
    console.error('Error checking team player achievement:', error);
    return;
  }
  
  if (count && count >= 5) {
    await checkAndAwardAchievement(userId, 'team_player', {
      collaboration_count: count
    });
  }
} 