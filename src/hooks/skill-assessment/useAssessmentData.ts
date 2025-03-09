
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SkillAssessment } from "./types";

export const useAssessmentData = (assessmentId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<string>("free");
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 1 hour default
  const [totalTime, setTotalTime] = useState<number>(3600); // 1 hour default

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId || !user) return;

      try {
        // Get user's tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .maybeSingle();
        
        setUserTier(profile?.subscription_tier || 'free');
        
        // Get assessment
        const { data, error } = await supabase
          .from("skill_assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();

        if (error) throw error;
        
        // Cast the JSON questions to the correct type
        const typedAssessment: SkillAssessment = {
          ...data,
          questions: data.questions as SkillAssessment['questions']
        };
        
        setAssessment(typedAssessment);
        
        // Set timer based on question count (2 minutes per question, min 30 minutes, max 2 hours)
        const questionCount = typedAssessment.questions?.length || 0;
        const calculatedTime = Math.max(30 * 60, Math.min(120 * 60, questionCount * 120));
        setTimeRemaining(calculatedTime);
        setTotalTime(calculatedTime);
        
        // Track assessment view
        try {
          await supabase.from('user_feature_interactions').insert({
            user_id: user.id,
            feature: 'skill-assessment-view',
            action: 'view',
            metadata: { assessment_id: assessmentId },
            timestamp: new Date().toISOString()
          });
        } catch (trackError) {
          console.error("Error tracking assessment view:", trackError);
          // Don't throw here, just log the error
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast({
          title: "Error",
          description: "Failed to load the assessment",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId, user, toast]);

  return {
    assessment,
    loading,
    userTier,
    error,
    setError,
    timeRemaining,
    setTimeRemaining,
    totalTime
  };
};
