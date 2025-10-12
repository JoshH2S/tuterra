import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Flame, Trophy } from "lucide-react";

interface ActivityStreakDisplayProps {
  className?: string;
  sessionId?: string;
}

interface ActivityStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  streak_start_date: string | null;
}

export function ActivityStreakDisplay({ className = "", sessionId }: ActivityStreakDisplayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streakData, setStreakData] = useState<ActivityStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchActivityStreak() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('user_activity_streaks')
          .select('current_streak, longest_streak, last_active_date, streak_start_date')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setStreakData(data);
        } else {
          // Initialize streak data for new users
          setStreakData({
            current_streak: 0,
            longest_streak: 0,
            last_active_date: null,
            streak_start_date: null
          });
        }
      } catch (error) {
        console.error("Error fetching activity streak:", error);
        toast({
          title: "Error",
          description: "Failed to load activity streak data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchActivityStreak();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner size="default" />
      </div>
    );
  }

  if (!streakData) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Current Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <span className="text-2xl font-bold text-orange-500">
            {streakData.current_streak}
          </span>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Longest Streak</span>
          </div>
          <span className="text-2xl font-bold text-yellow-500">
            {streakData.longest_streak}
          </span>
        </div>

        {/* Streak Details */}
        <div className="text-xs text-gray-500 space-y-1">
          {streakData.streak_start_date && (
            <div>Started: {formatDate(streakData.streak_start_date)}</div>
          )}
          {streakData.last_active_date && (
            <div>Last Active: {formatDate(streakData.last_active_date)}</div>
          )}
        </div>
      </div>
    </Card>
  );
} 