import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserSkillProgress, Skill } from '@/types/skills';

interface InternshipCompletionData {
  sessionId: string;
  userId: string;
  jobTitle: string;
  industry: string;
  companyName: string;
  isCompleted: boolean;
  completedAt?: string;
  totalTasks: number;
  completedTasks: number;
  skills: Array<UserSkillProgress & { skill: Skill }>;
  totalXP: number;
  averageLevel: number;
  topSkills: Array<UserSkillProgress & { skill: Skill }>;
  taskSubmissions: any[];
}

export function useInternshipCompletion(sessionId: string, userId: string) {
  const [loading, setLoading] = useState(false);
  const [completionData, setCompletionData] = useState<InternshipCompletionData | null>(null);
  const { toast } = useToast();

  const fetchCompletionData = useCallback(async (): Promise<InternshipCompletionData | null> => {
    if (!sessionId || !userId) return null;

    try {
      setLoading(true);

      // Get internship session data
      const { data: sessionData, error: sessionError } = await supabase
        .from('internship_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Internship session not found');
      }

      // Get company profile for branding
      const { data: companyProfile } = await supabase
        .from('internship_company_profiles')
        .select('company_name')
        .eq('session_id', sessionId)
        .single();

      // Get all tasks for this session
      const { data: tasks } = await supabase
        .from('internship_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('task_order');

      // Get task submissions with feedback
      const { data: submissions } = await supabase
        .from('internship_task_submissions')
        .select(`
          *,
          task:internship_tasks(title, description)
        `)
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at');

      // Get user skill progress with skill details
      const { data: skillProgress } = await supabase
        .from('user_skill_progress')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('user_id', userId)
        .order('current_level', { ascending: false })
        .order('current_xp', { ascending: false });

      // Calculate completion stats
      const totalTasks = tasks?.length || 0;
      const completedTasks = submissions?.length || 0;
      const totalXP = skillProgress?.reduce((sum, sp) => sum + sp.current_xp, 0) || 0;
      const averageLevel = skillProgress?.length 
        ? Math.round((skillProgress.reduce((sum, sp) => sum + sp.current_level, 0) / skillProgress.length) * 10) / 10
        : 0;

      // Get top 5 skills
      const topSkills = skillProgress?.slice(0, 5) || [];

      const data: InternshipCompletionData = {
        sessionId: sessionData.id,
        userId: sessionData.user_id,
        jobTitle: sessionData.job_title,
        industry: sessionData.industry,
        companyName: companyProfile?.company_name || 'Virtual Company',
        isCompleted: sessionData.is_completed || false,
        completedAt: sessionData.updated_at,
        totalTasks,
        completedTasks,
        skills: skillProgress || [],
        totalXP,
        averageLevel,
        topSkills,
        taskSubmissions: submissions || []
      };

      setCompletionData(data);
      return data;

    } catch (error) {
      console.error('Error fetching completion data:', error);
      toast({
        title: "Error loading internship data",
        description: "Failed to load completion information",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionId, userId, toast]);

  return {
    completionData,
    loading,
    fetchCompletionData
  };
}
