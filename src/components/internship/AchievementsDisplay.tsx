import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useAuth } from "@/hooks/useAuth";
import { AchievementCard } from "./AchievementCard";
import { fetchAchievementsWithProgress, Achievement } from "@/services/achievements";

interface AchievementsDisplayProps {
  className?: string;
}

interface AchievementWithProgress extends Achievement {
  isUnlocked: boolean;
  earnedAt?: string;
  metadata?: any;
}

interface AchievementStats {
  totalEarned: number;
  totalAvailable: number;
  categoryBreakdown: Record<string, number>;
}

export function AchievementsDisplay({ className = "" }: AchievementsDisplayProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalEarned: 0,
    totalAvailable: 0,
    categoryBreakdown: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch achievements with progress
        const achievementsWithProgress = await fetchAchievementsWithProgress(user.id);
        
        // Calculate stats
        const totalAvailable = achievementsWithProgress.length;
        const unlockedAchievements = achievementsWithProgress.filter(a => a.isUnlocked);
        const totalEarned = unlockedAchievements.length;
        
        // Calculate category breakdown
        const categoryBreakdown = unlockedAchievements.reduce((acc, achievement) => {
          acc[achievement.type] = (acc[achievement.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setAchievements(achievementsWithProgress);
        setStats({
          totalEarned,
          totalAvailable,
          categoryBreakdown
        });
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, [user]);

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'completion': return 'Task Completion';
      case 'engagement': return 'Engagement';
      case 'performance': return 'Performance';
      case 'milestone': return 'Milestones';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'completion': return 'bg-green-500';
      case 'engagement': return 'bg-blue-500';
      case 'performance': return 'bg-purple-500';
      case 'milestone': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner size="default" />
      </div>
    );
  }

  const completionPercentage = stats.totalAvailable > 0 
    ? Math.round((stats.totalEarned / stats.totalAvailable) * 100) 
    : 0;

  return (
    <div className={className}>
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalEarned}</div>
          <div className="text-xs text-gray-600">Earned</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{completionPercentage}%</div>
          <div className="text-xs text-gray-600">Progress</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">{stats.totalAvailable}</div>
          <div className="text-xs text-gray-600">Available</div>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryBreakdown).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
              <Badge 
                key={category}
                className={`${getCategoryColor(category)} text-white text-xs px-2 py-1`}
              >
                {getCategoryDisplayName(category)}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            title={achievement.title}
            description={achievement.description}
            icon={achievement.icon}
            type={achievement.type}
            earnedAt={achievement.earnedAt}
            metadata={achievement.metadata}
            isUnlocked={achievement.isUnlocked}
          />
        ))}
      </div>
    </div>
  );
} 