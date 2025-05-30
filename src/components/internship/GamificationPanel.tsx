import { PremiumCard } from "@/components/ui/premium-card";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { InternshipTask } from "./SwipeableInternshipView";
import { AchievementsDisplay } from "./AchievementsDisplay";
import { ActivityStreakDisplay } from "./ActivityStreakDisplay";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { checkTaskCompletionAchievements, checkTeamPlayerAchievement, updateActivityStreak } from "@/services/achievements";

interface GamificationPanelProps {
  sessionData: InternshipSession;
  tasks: InternshipTask[];
}

export function GamificationPanel({ sessionData, tasks }: GamificationPanelProps) {
  const { user } = useAuth();

  // Check for achievements whenever tasks change
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    // Update activity streak for visiting the page
    updateActivityStreak(user.id);
    
    // Check for achievements based on tasks
    const checkAchievements = async () => {
      // For each completed task, check for "fast learner" achievement
      tasks.forEach(task => {
        if (task.status === 'completed' && task.submission) {
          checkTaskCompletionAchievements(
            user.id,
            task.id,
            task.due_date,
            task.submission.created_at
          );
        }
      });
      
      // Check for team player achievement
      await checkTeamPlayerAchievement(user.id);
    };
    
    checkAchievements();
  }, [user, tasks]);

  return (
    <PremiumCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        
        <AchievementsDisplay className="mb-5" />
        
        {/* Streak tracker */}
        <div className="mt-5">
          <ActivityStreakDisplay />
        </div>
      </div>
    </PremiumCard>
  );
}
