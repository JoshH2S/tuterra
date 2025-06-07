import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Calendar, Trophy, Clock, Briefcase, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { resetVirtualInternshipStreak, recalculateVirtualInternshipStreak, updateVirtualInternshipStreak } from "@/services/achievements";
import { useToast } from "@/hooks/use-toast";

interface ActivityStreakDisplayProps {
  className?: string;
  sessionId?: string;
}

interface ActivityStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export function ActivityStreakDisplay({ className = "", sessionId }: ActivityStreakDisplayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [streakData, setStreakData] = useState<ActivityStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState<boolean>(false);
  const [loggingVisit, setLoggingVisit] = useState<boolean>(false);

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
      } catch (err: any) {
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

  const handleResetStreak = async () => {
    if (!user) return;
    
    setResetting(true);
    try {
      await resetVirtualInternshipStreak(user.id);
      
      // Immediately set streak data to zeros after successful reset
      setStreakData({
        current_streak: 0,
        longest_streak: 0,
        last_active_date: null
      });

      // Force a re-fetch after a short delay to ensure database is updated
      setTimeout(async () => {
        const { data, error } = await supabase
          .from('user_activity_streaks')
          .select('current_streak, longest_streak, last_active_date')
          .eq('user_id', user.id)
          .limit(1);
        
        if (!error && (!data || data.length === 0)) {
          // Confirm that the data was actually deleted
          setStreakData({
            current_streak: 0,
            longest_streak: 0,
            last_active_date: null
          });
        }
      }, 500);
      
      toast({
        title: "Streak Reset",
        description: "Your virtual internship streak has been reset. Visit again tomorrow to start a new streak!",
      });
    } catch (err) {
      console.error('Error resetting streak:', err);
      toast({
        title: "Error",
        description: "Failed to reset streak. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleLogTodaysVisit = async () => {
    if (!user) return;
    
    setLoggingVisit(true);
    try {
      await updateVirtualInternshipStreak(user.id, sessionId);
      
      // Refresh the data
      const { data, error } = await supabase
        .from('user_activity_streaks')
        .select('current_streak, longest_streak, last_active_date')
        .eq('user_id', user.id)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        setStreakData(data[0]);
      }
      
      toast({
        title: "Visit Logged!",
        description: "Your daily virtual internship visit has been recorded. Keep up the great work!",
      });
    } catch (err) {
      console.error('Error logging visit:', err);
      toast({
        title: "Error",
        description: "Failed to log today's visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoggingVisit(false);
    }
  };

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
            <h3 className="text-base font-medium flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Virtual Internship Streak
            </h3>
            <div className="text-sm text-muted-foreground">
              Track your daily virtual internship engagement
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get streak motivation message
  const getStreakMessage = (currentStreak: number) => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak === 1) return "Great start! Keep it up!";
    if (currentStreak < 7) return `${currentStreak} days strong!`;
    if (currentStreak === 7) return "One week streak! 🎉";
    if (currentStreak < 30) return `${currentStreak} days in a row!`;
    if (currentStreak === 30) return "30-day streak master! 🏆";
    return `${currentStreak} days of dedication!`;
  };

  return (
    <Card className={`h-full ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-base font-medium flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-amber-500" />
          Virtual Internship Streak
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
              Best Streak
            </div>
          </div>
        </div>
        
        {/* Motivation message */}
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-primary">
            {getStreakMessage(streakData?.current_streak || 0)}
          </p>
        </div>
        
        {streakData?.last_active_date && (
          <div className="mt-3 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Last visit: {format(parseISO(streakData.last_active_date), "MMM d, yyyy")}
            </span>
          </div>
        )}
        
        {/* Progress indicator for weekly milestone */}
        {(streakData?.current_streak || 0) < 7 && (
          <div className="mt-3 w-full bg-muted rounded-full h-1.5">
              <div 
              className="bg-gradient-to-r from-amber-400 to-amber-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ 
                width: `${((streakData?.current_streak || 0) / 7) * 100}%` 
              }}
            ></div>
          </div>
        )}
        
        {/* Debugging: Reset button */}
        <div className="mt-4 pt-2 border-t border-muted space-y-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleLogTodaysVisit}
            disabled={loggingVisit}
            className="w-full text-xs gap-1"
          >
            <Briefcase className="h-3 w-3" />
            {loggingVisit ? "Logging Visit..." : "Log Today's Visit"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetStreak}
            disabled={resetting}
            className="w-full text-xs gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            {resetting ? "Resetting..." : "Reset Streak (Debug)"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 