import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skill, UserSkillProgress } from '@/types/skills';
import { useToast } from '@/hooks/use-toast';

interface UseUserSkillsReturn {
  skills: Skill[];
  progress: UserSkillProgress[];
  loading: boolean;
  error: string | null;
  totalXP: number;
  averageLevel: number;
  refreshSkills: () => Promise<void>;
  getSkillProgress: (skillId: string) => UserSkillProgress | undefined;
}

export function useUserSkills(userId: string): UseUserSkillsReturn {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [progress, setProgress] = useState<UserSkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadSkills = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Load all available skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (skillsError) throw skillsError;

      // Load user skill progress with skill details
      const { data: progressData, error: progressError } = await supabase
        .from('user_skill_progress')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('user_id', userId)
        .order('current_level', { ascending: false })
        .order('current_xp', { ascending: false });

      if (progressError) throw progressError;

      // Create progress records for skills that user hasn't encountered yet
      const existingSkillIds = new Set((progressData || []).map(p => p.skill_id));
      const allSkillsProgress: UserSkillProgress[] = [];

      for (const skill of skillsData || []) {
        const existingProgress = progressData?.find(p => p.skill_id === skill.id);
        
        if (existingProgress) {
          allSkillsProgress.push({
            ...existingProgress,
            skill: skill
          });
        } else {
          // Create a virtual progress record for skills not yet encountered
          allSkillsProgress.push({
            id: `virtual-${skill.id}`,
            user_id: userId,
            skill_id: skill.id,
            current_xp: 0,
            current_level: 1,
            total_submissions: 0,
            evidence_submissions: [],
            last_activity: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skill: skill
          });
        }
      }

      setSkills(skillsData || []);
      setProgress(allSkillsProgress);

    } catch (err) {
      console.error('Error loading user skills:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load skills';
      setError(errorMessage);
      
      toast({
        title: "Error loading skills",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Load skills on mount and when userId changes
  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  // Set up real-time subscriptions for skill progress updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user_skills_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_skill_progress',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Skill progress updated:', payload);
          // Refresh skills when progress changes
          loadSkills();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadSkills]);

  // Refresh function
  const refreshSkills = useCallback(async () => {
    await loadSkills();
  }, [loadSkills]);

  // Helper function to get specific skill progress
  const getSkillProgress = useCallback((skillId: string) => {
    return progress.find(p => p.skill_id === skillId);
  }, [progress]);

  // Calculate derived statistics
  const totalXP = progress.reduce((sum, p) => sum + p.current_xp, 0);
  const activeProgress = progress.filter(p => p.current_xp > 0);
  const averageLevel = activeProgress.length > 0
    ? Math.round((activeProgress.reduce((sum, p) => sum + p.current_level, 0) / activeProgress.length) * 10) / 10
    : 0;

  return {
    skills,
    progress,
    loading,
    error,
    totalXP,
    averageLevel,
    refreshSkills,
    getSkillProgress
  };
}

// Additional hook for tracking recent skill gains
export function useRecentSkillGains(userId: string) {
  const [recentGains, setRecentGains] = useState<Array<{
    skillName: string;
    xpGained: number;
    newLevel?: number;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    if (!userId) return;

    // Listen for skill progress updates
    const channel = supabase
      .channel(`recent_gains_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_skill_progress',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          if (payload.new && payload.old) {
            const oldXP = payload.old.current_xp || 0;
            const newXP = payload.new.current_xp || 0;
            const xpGained = newXP - oldXP;

            if (xpGained > 0) {
              // Get skill name
              const { data: skill } = await supabase
                .from('skills')
                .select('name')
                .eq('id', payload.new.skill_id)
                .single();

              const newGain = {
                skillName: skill?.name || 'Unknown Skill',
                xpGained,
                newLevel: payload.new.current_level !== payload.old.current_level 
                  ? payload.new.current_level 
                  : undefined,
                timestamp: new Date().toISOString()
              };

              setRecentGains(prev => [newGain, ...prev].slice(0, 5)); // Keep last 5 gains
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return recentGains;
}
