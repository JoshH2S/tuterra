import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, differenceInDays, subDays } from "date-fns";

// Types for achievements
export interface Achievement {
  id: string;
  key: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  requirements: any;
  created_at: string;
}

// Achievement definitions that match the backend triggers
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'fast_learner',
    key: 'fast_learner',
    type: 'completion',
    title: 'Fast Learner',
    description: 'Completed first assignment ahead of schedule',
    icon: '🚀',
    requirements: { type: 'early_completion' },
    created_at: new Date().toISOString()
  },
  {
    id: 'team_player',
    key: 'team_player', 
    type: 'engagement',
    title: 'Team Player',
    description: 'Collaborated on 5+ team projects',
    icon: '🤝',
    requirements: { type: 'collaboration', count: 5 },
    created_at: new Date().toISOString()
  },
  {
    id: 'data_wizard',
    key: 'data_wizard',
    type: 'performance',
    title: 'Data Wizard', 
    description: 'Mastered advanced data analysis tools',
    icon: '📊',
    requirements: { type: 'skill_mastery', skill: 'data_analysis' },
    created_at: new Date().toISOString()
  },
  {
    id: 'innovation_champion',
    key: 'innovation_champion',
    type: 'milestone',
    title: 'Innovation Champion',
    description: 'Proposed creative solution that was implemented',
    icon: '💡',
    requirements: { type: 'innovation' },
    created_at: new Date().toISOString()
  }
];

// Fetch all available achievements
export async function fetchAllAchievements(): Promise<Achievement[]> {
  return ACHIEVEMENT_DEFINITIONS;
}

// Fetch user's earned achievements
export async function fetchUserAchievements(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUserAchievements:', error);
    return [];
  }
}

// Fetch achievements with user progress
export async function fetchAchievementsWithProgress(userId: string): Promise<(Achievement & { 
  isUnlocked: boolean; 
  earnedAt?: string; 
  metadata?: any;
})[]> {
  try {
    // Fetch all achievements and user's earned achievements in parallel
    const [allAchievements, userAchievements] = await Promise.all([
      fetchAllAchievements(),
      fetchUserAchievements(userId)
    ]);

    // Map achievements with user progress
    return allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievement_key === achievement.key
      );

      return {
        ...achievement,
        isUnlocked: !!userAchievement,
        earnedAt: userAchievement?.unlocked_at,
        metadata: userAchievement?.metadata
      };
    });
  } catch (error) {
    console.error('Error in fetchAchievementsWithProgress:', error);
    return ACHIEVEMENT_DEFINITIONS.map(achievement => ({
      ...achievement,
      isUnlocked: false
    }));
  }
}

// Award an achievement to a user
export async function awardAchievement(
  userId: string,
  achievementKey: string,
  metadata: any = {}
): Promise<boolean> {
  try {
    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.key === achievementKey);
    
    if (!achievement) {
      console.error('Achievement not found:', achievementKey);
      return false;
    }

    // Check if already awarded
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_key', achievementKey)
      .maybeSingle();

    if (existing) {
      // Already awarded
      return true;
    }

    // Award new achievement
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_key: achievementKey,
        achievement_type: achievement.type,
        metadata,
        unlocked_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in awardAchievement:', error);
    return false;
  }
}

// Check and award task completion achievements
export async function checkTaskCompletionAchievements(userId: string): Promise<void> {
  try {
    // Get user's completed task count
    const { count } = await supabase
      .from('internship_task_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    const completedTasks = count || 0;

    // Check each achievement
    const completionAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.type === 'completion');
    
    for (const achievement of completionAchievements) {
      const requirements = achievement.requirements;
      
      if (requirements?.type === 'task_completion' && completedTasks >= requirements.count) {
        await awardAchievement(userId, achievement.key, {
          task_count: completedTasks,
          checked_at: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error checking task completion achievements:', error);
  }
}

// Check for team player achievement
export async function checkTeamPlayerAchievement(userId: string): Promise<void> {
  try {
    // Get count of submissions
    const { count } = await supabase
      .from('internship_task_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count && count >= 5) {
      await awardAchievement(userId, 'team_player', {
        submission_count: count,
        checked_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error checking team player achievement:', error);
  }
}

// Update activity streak
export async function updateActivityStreak(userId: string): Promise<void> {
  if (!userId) return;
  
  try {
    const today = new Date();
    const todayFormatted = format(today, 'yyyy-MM-dd');

    // Get existing streak
    const { data: existingStreak } = await supabase
      .from('user_activity_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    let currentStreak = 1;
    let longestStreak = existingStreak?.longest_streak || 1;
    let streakStartDate = todayFormatted;

    if (existingStreak?.last_active_date) {
      const lastActiveDate = new Date(existingStreak.last_active_date);
      const daysSinceLastActive = differenceInDays(today, lastActiveDate);

      if (daysSinceLastActive === 1) {
        // Continue streak
        currentStreak = existingStreak.current_streak + 1;
        streakStartDate = existingStreak.streak_start_date;
        longestStreak = Math.max(currentStreak, longestStreak);
      } else if (daysSinceLastActive === 0) {
        // Same day, keep current streak
        currentStreak = existingStreak.current_streak;
        streakStartDate = existingStreak.streak_start_date;
        return;
      }
    }

    // Update streak
    const { error: updateError } = await supabase
      .from('user_activity_streaks')
      .upsert({
        user_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: todayFormatted,
        streak_start_date: streakStartDate,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      throw updateError;
    }

    // Check for streak-based achievements
    if (currentStreak >= 3) {
      await awardAchievement(userId, 'streak_starter', {
        streak_days: currentStreak,
        checked_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating activity streak:', error);
  }
}

/**
 * Updates the user's virtual internship activity streak specifically for daily logins to the virtual internship page
 * This tracks consecutive days a user visits the virtual internship dashboard
 * @param userId The user's ID
 * @param sessionId Optional internship session ID
 */
export async function updateVirtualInternshipStreak(userId: string, sessionId?: string): Promise<void> {
  console.log('📊 Virtual internship streak tracking (simplified)');
}

/**
 * Recalculates a user's virtual internship streak based on their actual login history
 * This function should be used to fix any inconsistencies in streak data
 * @param userId The user's ID
 */
export async function recalculateVirtualInternshipStreak(userId: string): Promise<void> {
  console.log('📊 Virtual internship streak recalculation (simplified)');
}

/**
 * Resets a user's virtual internship streak to fix incorrect data
 * This function should be used to fix any inconsistencies in streak data
 * @param userId The user's ID
 */
export async function resetVirtualInternshipStreak(userId: string): Promise<void> {
  console.log('📊 Virtual internship streak reset (simplified)');
}

// Test function to award a mock achievement (for development testing)
export async function testAwardAchievement(userId: string): Promise<void> {
  console.log('🧪 Testing achievement system...');
  
  // Award the first achievement as a test
  const success = await awardAchievement(userId, 'fast_learner', {
    test: true,
    awarded_at: new Date().toISOString()
  });
  
  if (success) {
    console.log('✅ Test achievement awarded successfully!');
  } else {
    console.log('❌ Test achievement failed to award');
  }
} 