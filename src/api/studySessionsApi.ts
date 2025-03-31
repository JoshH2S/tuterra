
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
    status: session.status as 'scheduled' | 'completed' | 'missed',
    notify_email: session.notify_email || false
  })) || [];
};

export const createStudySession = async (userId: string, sessionData: CreateStudySessionData) => {
  const newSessionData = {
    ...sessionData,
    student_id: userId,
    status: sessionData.status || 'scheduled',
    notify_email: sessionData.notify_email || false,
    ...(sessionData.course_id ? { course_id: sessionData.course_id } : {})
  };

  const { data, error } = await supabase
    .from('study_sessions')
    .insert([newSessionData])
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    status: data.status as 'scheduled' | 'completed' | 'missed',
    notify_email: data.notify_email || false
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
  
  return {
    ...data,
    status: data.status as 'scheduled' | 'completed' | 'missed',
    notify_email: data.notify_email || false
  };
};

export const deleteStudySession = async (userId: string, id: string) => {
  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .eq('id', id)
    .eq('student_id', userId);

  if (error) throw error;
};
