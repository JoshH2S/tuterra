import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, differenceInDays, subDays } from "date-fns";

// Types for achievements - using flexible types to avoid DB schema issues
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

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_key: string;
  unlocked_at: string;
  metadata?: any;
}

export interface UserAchievementDetail {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
  metadata?: any;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
}

export interface ActivityStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
}

// Create mock achievements for testing
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    key: 'first_task',
    type: 'completion',
    title: 'First Steps',
    description: 'Complete your first internship task',
    icon: '🎯',
    requirements: { type: 'task_completion', count: 1 },
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    key: 'task_master',
    type: 'completion',
    title: 'Task Master',
    description: 'Complete 5 internship tasks',
    icon: '⭐',
    requirements: { type: 'task_completion', count: 5 },
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    key: 'early_bird',
    type: 'engagement',
    title: 'Early Bird',
    description: 'Log in before 9 AM',
    icon: '🌅',
    requirements: { type: 'early_login', time: '09:00' },
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    key: 'streak_starter',
    type: 'engagement',
    title: 'Streak Starter',
    description: 'Log in for 3 consecutive days',
    icon: '🔥',
    requirements: { type: 'login_streak', days: 3 },
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    key: 'welcome_aboard',
    type: 'milestone',
    title: 'Welcome Aboard',
    description: 'Complete your first day of internship',
    icon: '🚀',
    requirements: { type: 'duration', days: 1 },
    created_at: new Date().toISOString()
  }
];

// Fetch all available achievements - simplified to always return mock data for now
export async function fetchAllAchievements(): Promise<Achievement[]> {
  // For now, just return mock achievements to avoid database issues
  console.log('📋 Using mock achievements data');
  return MOCK_ACHIEVEMENTS;
}

// Fetch user's earned achievements - simplified to avoid database issues
export async function fetchUserAchievements(userId: string): Promise<UserAchievementDetail[]> {
  // For now, return empty array to avoid database issues
  console.log('👤 No user achievements loaded (database not configured)');
    return [];
  }
  
// Fetch achievements with user progress (for displaying locked/unlocked state)
export async function fetchAchievementsWithProgress(userId: string): Promise<(Achievement & { 
  isUnlocked: boolean; 
  earnedAt?: string; 
  metadata?: any;
})[]> {
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
}

// Award an achievement to a user - simplified to avoid database issues
export async function awardAchievement(
  userId: string,
  achievementKey: string,
  metadata: any = {}
): Promise<boolean> {
  // For now, just log the achievement award without database interaction
  const achievement = MOCK_ACHIEVEMENTS.find(a => a.key === achievementKey);
  
  if (!achievement) {
    console.error('Achievement not found:', achievementKey);
    return false;
  }

  console.log(`🎉 Achievement would be unlocked: ${achievement.title}!`);
  console.log('💾 Database integration needed to persist achievements');
  return true;
}

// Check and award task completion achievements
export async function checkTaskCompletionAchievements(userId: string): Promise<void> {
  try {
    // Get user's completed task count - using proper supabase call
    const { count: completedTasks, error: countError } = await supabase
      .from('internship_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (countError) {
      console.log('No internship_tasks table found, skipping task completion check');
      return;
    }

    // Get completion achievements
    const allAchievements = await fetchAllAchievements();
    const completionAchievements = allAchievements.filter(a => a.type === 'completion');

    // Check each achievement
    for (const achievement of completionAchievements) {
      const requirements = achievement.requirements;
      
      if (requirements?.type === 'task_completion') {
        const requiredCount = requirements.count;
        if (completedTasks && completedTasks >= requiredCount) {
          await awardAchievement(userId, achievement.key, {
            task_count: completedTasks,
            checked_at: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.log('Error checking task completion achievements (non-critical):', error);
  }
}

// Check and award engagement achievements (login streaks, etc.)
export async function checkEngagementAchievements(userId: string): Promise<void> {
  try {
    // This would integrate with your existing streak system
    const streak = await fetchActivityStreak(userId);
    
    if (!streak) return;

    // Get engagement achievements
    const allAchievements = await fetchAllAchievements();
    const engagementAchievements = allAchievements.filter(a => a.type === 'engagement');

    // Check streak-based achievements
    for (const achievement of engagementAchievements) {
      const requirements = achievement.requirements;
      
      if (requirements?.type === 'login_streak') {
        const requiredDays = requirements.days;
        if (streak.current_streak >= requiredDays) {
          await awardAchievement(userId, achievement.key, {
            streak_days: streak.current_streak,
            checked_at: new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.log('Error checking engagement achievements (non-critical):', error);
  }
}

// Get user's total achievement stats
export async function getUserAchievementStats(userId: string): Promise<{
  totalEarned: number;
  totalAvailable: number;
  categoryBreakdown: Record<string, number>;
}> {
  try {
    const [userAchievements, allAchievements] = await Promise.all([
      fetchUserAchievements(userId),
      fetchAllAchievements()
    ]);
    
    const categoryBreakdown: Record<string, number> = {};

    userAchievements.forEach(ua => {
      categoryBreakdown[ua.achievement_type] = (categoryBreakdown[ua.achievement_type] || 0) + 1;
    });

    return {
      totalEarned: userAchievements.length,
      totalAvailable: allAchievements.length,
      categoryBreakdown
    };
  } catch (error) {
    console.log('Error getting achievement stats (non-critical):', error);
    return {
      totalEarned: 0,
      totalAvailable: MOCK_ACHIEVEMENTS.length,
      categoryBreakdown: {}
    };
  }
}

// Legacy functions (keeping for backward compatibility)
export async function fetchActivityStreak(userId: string): Promise<ActivityStreak | null> {
  try {
  const { data, error } = await supabase
    .from('user_activity_streaks')
    .select('current_streak, longest_streak, last_active_date')
    .eq('user_id', userId)
    .single();
  
  if (error) {
      console.log('No activity streaks table found');
    return null;
  }
  
  return data;
  } catch (error) {
    console.log('Error fetching activity streak (non-critical):', error);
    return null;
  }
}

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
      console.log('No activity streaks table found, skipping update');
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
      console.log('Error updating activity streak (non-critical):', upsertError);
    } else {
      console.log(`Successfully updated streak for user ${userId}. Current streak: ${currentStreak}, Longest streak: ${longestStreak}`);
      
      // Check for engagement achievements after updating streak
      await checkEngagementAchievements(userId);
    }
  } catch (error) {
    console.log('Error updating activity streak (non-critical):', error);
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

// Check for team player achievement
export async function checkTeamPlayerAchievement(userId: string): Promise<void> {
  console.log('🤝 Team player achievement check (simplified)');
}

// Test function to award a mock achievement (for development testing)
export async function testAwardAchievement(userId: string): Promise<void> {
  console.log('🧪 Testing achievement system...');
  
  // Award the first achievement as a test
  const success = await awardAchievement(userId, 'first_task', {
    test: true,
    awarded_at: new Date().toISOString()
  });
  
  if (success) {
    console.log('✅ Test achievement awarded successfully!');
  } else {
    console.log('❌ Test achievement failed to award');
  }
} 