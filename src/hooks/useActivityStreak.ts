import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { updateVirtualInternshipStreak } from '@/services/achievements';

interface ActivityStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export function useActivityStreak() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<ActivityStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Update streak via API endpoint
  const updateStreak = async () => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/user/update-activity-streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Error updating streak: Status', response.status);
        return null;
      }
      
      const data = await response.json();
      setStreakData(data.data);
      return data.data;
    } catch (err) {
      console.error('Failed to update activity streak:', err);
      return null;
    }
  };

  // Fetch streak data
  const fetchStreak = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_activity_streaks')
        .select('current_streak, longest_streak, last_active_date')
        .eq('user_id', user.id)
        .limit(1);
      
      if (error) {
        console.error("Error fetching activity streak:", error);
        setError("Failed to load activity streak data");
        // Set default values even if there's an error
        setStreakData({
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null
        });
      } else if (data && data.length > 0) {
        setStreakData(data[0]);
      } else {
        // No record found, use default values
        setStreakData({
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching activity streak:", err);
      setError("An unexpected error occurred");
      // Set default values even if there's an error
      setStreakData({
        current_streak: 0,
        longest_streak: 0,
        last_active_date: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Update streak on initial load
  useEffect(() => {
    if (user) {
      updateStreak().then(() => {
        setLoading(false);
      }).catch(() => {
        // If update fails, at least try to fetch existing data
        fetchStreak();
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    streakData,
    loading,
    error,
    updateStreak,
    fetchStreak
  };
}

/**
 * Hook specifically for tracking virtual internship daily login streaks
 * This tracks consecutive days a user visits the virtual internship dashboard
 */
export function useVirtualInternshipStreak() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<ActivityStreak | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Update virtual internship streak
  const updateStreak = async () => {
    if (!user) return null;
    
    try {
      await updateVirtualInternshipStreak(user.id);
      // After updating, fetch the latest data
      await fetchStreak();
      return streakData;
    } catch (err) {
      console.error('Failed to update virtual internship streak:', err);
      return null;
    }
  };

  // Fetch streak data
  const fetchStreak = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_activity_streaks')
        .select('current_streak, longest_streak, last_active_date')
        .eq('user_id', user.id)
        .limit(1);
      
      if (error) {
        console.error("Error fetching virtual internship streak:", error);
        setError("Failed to load streak data");
        setStreakData({
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null
        });
      } else if (data && data.length > 0) {
        setStreakData(data[0]);
      } else {
        // No record found, use default values
        setStreakData({
          current_streak: 0,
          longest_streak: 0,
          last_active_date: null
        });
      }
    } catch (err) {
      console.error("Unexpected error fetching virtual internship streak:", err);
      setError("An unexpected error occurred");
      setStreakData({
        current_streak: 0,
        longest_streak: 0,
        last_active_date: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-update streak when hook is used (e.g., when user visits virtual internship page)
  useEffect(() => {
    if (user) {
      updateStreak();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    streakData,
    loading,
    error,
    updateStreak,
    fetchStreak
  };
} 