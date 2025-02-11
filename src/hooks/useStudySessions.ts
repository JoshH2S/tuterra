
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface StudySession {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  course_id: string | null;
  status: 'scheduled' | 'completed' | 'missed';
}

export const useStudySessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudySessions();
  }, []);

  const fetchStudySessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('student_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load study sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (sessionData: Omit<StudySession, 'id' | 'student_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('study_sessions')
        .insert([{ ...sessionData, student_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setSessions(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Study session scheduled successfully.",
      });
      return data;
    } catch (error) {
      console.error('Error creating study session:', error);
      toast({
        title: "Error",
        description: "Failed to schedule study session. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSession = async (id: string, updates: Partial<StudySession>) => {
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setSessions(prev => prev.map(session => session.id === id ? data : session));
      toast({
        title: "Success",
        description: "Study session updated successfully.",
      });
      return data;
    } catch (error) {
      console.error('Error updating study session:', error);
      toast({
        title: "Error",
        description: "Failed to update study session. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSessions(prev => prev.filter(session => session.id !== id));
      toast({
        title: "Success",
        description: "Study session deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting study session:', error);
      toast({
        title: "Error",
        description: "Failed to delete study session. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    sessions,
    isLoading,
    createSession,
    updateSession,
    deleteSession,
    refreshSessions: fetchStudySessions,
  };
};
