
import { supabase } from "@/integrations/supabase/client";
import { CreateStudySessionData, StudySession } from "@/types/study-sessions";
import { toast } from "@/hooks/use-toast";

export const fetchStudySessions = async (userId: string) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('student_id', userId);

  if (error) throw error;
  
  return data?.map(session => ({
    ...session,
    status: session.status as 'scheduled' | 'completed' | 'missed'
  })) || [];
};

export const createStudySession = async (userId: string, sessionData: CreateStudySessionData) => {
  const newSessionData = {
    ...sessionData,
    student_id: userId,
    status: sessionData.status || 'scheduled',
    ...(sessionData.course_id ? { course_id: sessionData.course_id } : {})
  };

  // Create study session in database
  const { data, error } = await supabase
    .from('study_sessions')
    .insert([newSessionData])
    .select()
    .single();

  if (error) throw error;
  
  // If the user opted for notifications, call the notification scheduler
  if (newSessionData.notify_user === true) {
    try {
      await supabase.functions.invoke('session-reminders', {
        body: { 
          action: 'schedule',
          session_id: data.id,
          student_id: userId,
          title: data.title,
          start_time: data.start_time
        }
      });
    } catch (notificationError) {
      console.error('Failed to schedule notification:', notificationError);
      // Don't block the session creation if notification scheduling fails
      toast({
        title: "Session created",
        description: "But we couldn't schedule your notification. You may not receive a reminder.",
        variant: "default",
      });
    }
  }
  
  return {
    ...data,
    status: data.status as 'scheduled' | 'completed' | 'missed'
  };
};

export const updateStudySession = async (userId: string, id: string, updates: Partial<StudySession>) => {
  const cleanUpdates = {
    ...updates,
    ...(updates.course_id ? { course_id: updates.course_id } : {})
  };

  const { data, error } = await supabase
    .from('study_sessions')
    .update(cleanUpdates)
    .eq('id', id)
    .eq('student_id', userId)
    .select()
    .single();

  if (error) throw error;
  
  // If notification preference is updated, handle accordingly
  if (updates.notify_user !== undefined) {
    if (updates.notify_user === true) {
      // Schedule a notification
      try {
        await supabase.functions.invoke('session-reminders', {
          body: { 
            action: 'schedule',
            session_id: id,
            student_id: userId,
            title: data.title,
            start_time: data.start_time
          }
        });
      } catch (notificationError) {
        console.error('Failed to schedule notification:', notificationError);
      }
    } else {
      // Cancel any existing notification
      try {
        await supabase.functions.invoke('session-reminders', {
          body: { 
            action: 'cancel',
            session_id: id
          }
        });
      } catch (notificationError) {
        console.error('Failed to cancel notification:', notificationError);
      }
    }
  }
  
  return {
    ...data,
    status: data.status as 'scheduled' | 'completed' | 'missed'
  };
};

export const deleteStudySession = async (userId: string, id: string) => {
  // First try to cancel any notifications
  try {
    await supabase.functions.invoke('session-reminders', {
      body: { 
        action: 'cancel',
        session_id: id
      }
    });
  } catch (notificationError) {
    console.error('Failed to cancel notification:', notificationError);
    // Continue with deletion even if notification cancellation fails
  }

  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .eq('id', id)
    .eq('student_id', userId);

  if (error) throw error;
};
