import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Calendar, Trophy, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-states";

interface ActivityStreakDisplayProps {
  className?: string;
}

interface ActivityStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export function ActivityStreakDisplay({ className = "" }: ActivityStreakDisplayProps) {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<ActivityStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivityStreak() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Simple approach: Just try to get the data
        const { data, error } = await supabase
          .from('user_activity_streaks')
          .select('current_streak, longest_streak, last_active_date')
          .eq('user_id', user.id)
          .limit(1);
        
        if (error) {
          console.error("Error fetching activity streak:", error);
          setError("Failed to load activity streak data");
          setStreakData({
            current_streak: 0,
            longest_streak: 0,
            last_active_date: null
          });
        } else if (data && data.length > 0) {
          setStreakData(data[0]);
        } else {
          // No data found, use defaults
          setStreakData({
            current_streak: 0,
            longest_streak: 0,
            last_active_date: null
          });
          
          // Try to create a basic record
          try {
            await supabase
              .from('user_activity_streaks')
              .insert({
                user_id: user.id,
                current_streak: 0,
                longest_streak: 0,
                updated_at: new Date().toISOString()
              });
          } catch (insertErr) {
            console.error("Error creating streak record:", insertErr);
            // Don't show error to user, just log it
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching activity streak:", err);
        setError("An unexpected error occurred");
        setStreakData({
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null
        });
      } finally {
        setLoading(false);
      }
    }

    fetchActivityStreak();
  }, [user]);

  if (loading) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center p-6 h-full">
          <LoadingSpinner size="default" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Return a more subtle error state
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <h3 className="text-base font-medium">Activity Streak</h3>
            <div className="text-sm text-muted-foreground">
              Track your daily login streak to build consistency
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-base font-medium flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-amber-500" />
          Activity Streak
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {streakData?.current_streak || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Current Streak
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {streakData?.longest_streak || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              Longest Streak
            </div>
          </div>
        </div>
        
        {streakData?.last_active_date && (
          <div className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Last active: {format(parseISO(streakData.last_active_date), "MMM d, yyyy")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 