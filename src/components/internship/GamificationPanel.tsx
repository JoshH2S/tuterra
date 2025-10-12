import { PremiumCard } from "@/components/ui/premium-card";
import { InternshipSession, InternshipTask } from "@/types/internship";
import { AchievementsDisplay } from "./AchievementsDisplay";
import { ActivityStreakDisplay } from "./ActivityStreakDisplay";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { checkTaskCompletionAchievements, checkTeamPlayerAchievement, updateActivityStreak } from "@/services/achievements";
import { useToast } from "@/hooks/use-toast";

interface GamificationPanelProps {
  sessionData: InternshipSession;
  tasks: InternshipTask[];
}

export function GamificationPanel({ sessionData, tasks }: GamificationPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Check for achievements whenever tasks change
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    // Update activity streak for visiting the page
    const updateAchievements = async () => {
      try {
        // Update activity streak
        await updateActivityStreak(user.id);

        // Check for achievements based on tasks
        const completedTasks = tasks.filter(task => 
          task.status === 'completed' || 
          task.status === 'feedback_pending' || 
          task.status === 'feedback_received'
        );
        
        if (completedTasks.length > 0) {
          // Check for task completion achievements
          await checkTaskCompletionAchievements(user.id);
          
          // Check for team player achievement
          await checkTeamPlayerAchievement(user.id);

          // Check for early completion (fast learner achievement)
          const earlyCompletions = completedTasks.filter(task => {
            const dueDate = new Date(task.due_date);
            const completedDate = task.submission?.created_at 
              ? new Date(task.submission.created_at)
              : new Date();
            return completedDate < dueDate;
          });

          if (earlyCompletions.length > 0) {
            console.log('Early completion detected - fast_learner achievement may be triggered');
          }
        }

      } catch (error) {
        console.error('Error updating achievements:', error);
        toast({
          title: "Achievement Update Error",
          description: "There was an error updating your achievements. Please try again later.",
          variant: "destructive",
        });
      }
    };

    updateAchievements();
  }, [user, tasks, toast]);

  return (
    <PremiumCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        
        <AchievementsDisplay className="mb-5" />
        
        {/* Streak tracker */}
        <div className="mt-5">
          <ActivityStreakDisplay sessionId={sessionData.id} />
        </div>
      </div>
    </PremiumCard>
  );
}
