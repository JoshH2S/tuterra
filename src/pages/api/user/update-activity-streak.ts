import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { format, differenceInDays } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createServerSupabaseClient<Database>({ req, res });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = session.user.id;
    const today = new Date();
    const todayFormatted = format(today, 'yyyy-MM-dd');
    
    // Get existing streak data
    const { data, error } = await supabase
      .from('user_activity_streaks')
      .select('id, current_streak, longest_streak, last_active_date')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error fetching activity streak:', error);
      return res.status(500).json({ error: 'Failed to fetch activity streak' });
    }
    
    const existingStreak = data && data.length > 0 ? data[0] : null;
    
    // Calculate new streak values
    let currentStreak = 1; // Default for new users
    let longestStreak = 1; // Default for new users
    
    if (existingStreak) {
      const lastActiveDate = existingStreak.last_active_date 
        ? new Date(existingStreak.last_active_date) 
        : null;
      
      if (lastActiveDate) {
        const daysSinceLastActive = differenceInDays(today, lastActiveDate);
        
        // If user was active yesterday, increment the streak
        if (daysSinceLastActive === 1) {
          currentStreak = existingStreak.current_streak + 1;
          longestStreak = Math.max(currentStreak, existingStreak.longest_streak);
        }
        // If user is active again today, keep the streak the same
        else if (daysSinceLastActive === 0) {
          // No update needed, return current data
          return res.status(200).json({ 
            message: 'Already updated today',
            data: existingStreak
          });
        }
        // If user missed days, reset the streak
        else {
          currentStreak = 1;
          longestStreak = existingStreak.longest_streak;
        }
      }
    }
    
    // Prepare streak record data
    const streakData = {
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: todayFormatted,
      updated_at: new Date().toISOString()
    };
    
    let result;
    
    if (existingStreak) {
      // Update existing record
      const { data: updatedData, error: updateError } = await supabase
        .from('user_activity_streaks')
        .update(streakData)
        .eq('id', existingStreak.id)
        .select()
        .limit(1);
      
      if (updateError) {
        console.error('Error updating activity streak:', updateError);
        return res.status(500).json({ error: 'Failed to update activity streak' });
      }
      
      result = updatedData && updatedData.length > 0 ? updatedData[0] : null;
    } else {
      // Insert new record
      const { data: insertedData, error: insertError } = await supabase
        .from('user_activity_streaks')
        .insert(streakData)
        .select()
        .limit(1);
      
      if (insertError) {
        console.error('Error creating activity streak:', insertError);
        return res.status(500).json({ error: 'Failed to create activity streak' });
      }
      
      result = insertedData && insertedData.length > 0 ? insertedData[0] : null;
    }
    
    return res.status(200).json({ 
      message: 'Activity streak updated successfully',
      data: result || streakData // Fallback to the data we tried to save
    });
  } catch (error) {
    console.error('Unexpected error updating activity streak:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 