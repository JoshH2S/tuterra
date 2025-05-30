import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useAuth } from "@/hooks/useAuth";
import { Achievement, fetchUserAchievements } from "@/services/achievements";

interface AchievementsDisplayProps {
  className?: string;
}

export function AchievementsDisplay({ className = "" }: AchievementsDisplayProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      if (!user) return;
      
      setLoading(true);
      try {
        const userAchievements = await fetchUserAchievements(user.id);
        setAchievements(userAchievements);
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner size="default" />
      </div>
    );
  }

  // If no achievements, show placeholders with locked state
  const defaultAchievements = [
    {
      key: 'fast_learner',
      title: 'Fast Learner',
      description: 'Completed first assignment ahead of schedule',
      icon: '🚀',
      unlocked: false
    },
    {
      key: 'team_player',
      title: 'Team Player',
      description: 'Collaborated on 5+ team projects',
      icon: '🤝',
      unlocked: false
    },
    {
      key: 'data_wizard',
      title: 'Data Wizard',
      description: 'Mastered advanced data analysis tools',
      icon: '📊',
      unlocked: false
    },
    {
      key: 'innovation_champion',
      title: 'Innovation Champion',
      description: 'Suggested creative solution that was implemented',
      icon: '💡',
      unlocked: false
    }
  ];

  // Mark achievements as unlocked if they exist in the fetched achievements
  const displayAchievements = defaultAchievements.map(achievement => {
    const userAchievement = achievements.find(a => a.key === achievement.key);
    return {
      ...achievement,
      unlocked: !!userAchievement,
      unlocked_at: userAchievement?.unlocked_at
    };
  });

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {displayAchievements.map((achievement) => (
        <Card
          key={achievement.key}
          className={`flex items-center p-4 ${!achievement.unlocked ? 'opacity-50' : ''}`}
        >
          <div className="text-3xl mr-4">{achievement.icon}</div>
          <div>
            <h3 className="font-medium">{achievement.title}</h3>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            {achievement.unlocked && achievement.unlocked_at && (
              <p className="text-xs text-primary mt-1">
                Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 