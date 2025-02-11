
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StudySession, CreateStudySessionData } from "@/types/study-sessions";
import { fetchStudySessions, createStudySession, updateStudySession, deleteStudySession } from "@/api/studySessionsApi";
import { logStudySessionActivity } from "@/api/activityLogsApi";

export type { StudySession };

export const useStudySessions = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserStudySessions();
  }, []);

  const fetchUserStudySessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view study sessions.",
          variant: "destructive",
        });
        return;
      }

      const data = await fetchStudySessions(user.id);
      setSessions(data);
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

  const handleCreateSession = async (sessionData: CreateStudySessionData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create study sessions.",
          variant: "destructive",
        });
        return;
      }

      const newSession = await createStudySession(user.id, sessionData);
      setSessions(prev => [...prev, newSession]);
      
      await logStudySessionActivity(user.id, `Scheduled a new study session: ${newSession.title}`, newSession);
      
      toast({
        title: "Success",
        description: "Study session scheduled successfully.",
      });
      
      return newSession;
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

  const handleUpdateSession = async (id: string, updates: Partial<StudySession>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update study sessions.",
          variant: "destructive",
        });
        return;
      }

      const updatedSession = await updateStudySession(user.id, id, updates);
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ));
      
      await logStudySessionActivity(user.id, `Updated study session: ${updatedSession.title}`, updatedSession);
      
      toast({
        title: "Success",
        description: "Study session updated successfully.",
      });
      
      return updatedSession;
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

  const handleDeleteSession = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to delete study sessions.",
          variant: "destructive",
        });
        return;
      }

      const sessionToDelete = sessions.find(s => s.id === id);
      if (!sessionToDelete) return;

      await deleteStudySession(user.id, id);
      setSessions(prev => prev.filter(session => session.id !== id));
      
      await logStudySessionActivity(user.id, `Deleted study session: ${sessionToDelete.title}`, sessionToDelete);
      
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
    createSession: handleCreateSession,
    updateSession: handleUpdateSession,
    deleteSession: handleDeleteSession,
    refreshSessions: fetchUserStudySessions,
  };
};
