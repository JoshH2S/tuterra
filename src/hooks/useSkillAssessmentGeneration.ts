import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for assessment parameters
export interface AssessmentParams {
  industry: string;
  role: string;
  additionalInfo?: string;
  questionCount: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

// Determine model type based on user subscription tier
const determineModelType = (tier: string = 'free') => {
  switch (tier) {
    case 'premium':
      return 'gpt-3.5-turbo';
    case 'pro':
      return 'gpt-3.5-turbo';
    default:
      return 'gpt-3.5-turbo';
  }
};

// Get token limit based on subscription tier
const getTokenLimit = (tier: string = 'free') => {
  switch (tier) {
    case 'premium':
      return 16000;
    case 'pro':
      return 8000;
    default:
      return 4000;
  }
};

// Hook for handling assessment generation
export const useSkillAssessmentGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Track feature interaction (analytics)
  const trackFeatureInteraction = async (feature: string, action: string) => {
    try {
      if (!user) return;
      
      await supabase.from('user_feature_interactions').insert({
        user_id: user.id,
        feature,
        action,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking feature interaction:', error);
    }
  };

  // Check if user can generate an assessment based on their tier
  const checkAssessmentAllowance = async () => {
    if (!user) return false;
    
    try {
      // Get user's subscription tier from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();
      
      const tier = profile?.subscription_tier || 'free';
      
      // Get count of assessments created in the current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('skill_assessments')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
        
      if (error) throw error;
      
      // Check limits based on tier
      if (tier === 'premium') return true; // Unlimited
      if (tier === 'pro' && (count || 0) < 20) return true;
      if (tier === 'free' && (count || 0) < 3) return true;
      
      return false;
    } catch (error) {
      console.error('Error checking assessment allowance:', error);
      return false;
    }
  };

  // Generate assessment
  const generateAssessment = async (params: AssessmentParams) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate skill assessments",
        variant: "destructive",
      });
      return null;
    }

    // Check if user can generate an assessment
    const canGenerate = await checkAssessmentAllowance();
    if (!canGenerate) {
      toast({
        title: "Assessment limit reached",
        description: "Upgrade your subscription to generate more assessments",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    setProgress(10);

    try {
      // Track usage before generation
      await trackFeatureInteraction('skill-assessment-generation', 'start');
      
      // Check cache for similar assessment
      const cacheKey = `assessment:${params.industry}:${params.role}:${params.level || 'intermediate'}`;
      const { data: cachedAssessment } = await supabase
        .from('cached_assessments')
        .select('*')
        .eq('cache_key', cacheKey)
        .gt('cached_until', new Date().toISOString())
        .maybeSingle();

      setProgress(30);

      if (cachedAssessment && cachedAssessment.assessment_data) {
        // Use cached assessment
        await trackFeatureInteraction('skill-assessment-generation', 'cache-hit');
        setProgress(100);
        setIsGenerating(false);
        return cachedAssessment.assessment_data;
      }

      // Get user's subscription tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();
      
      const tier = profile?.subscription_tier || 'free';
      const modelType = determineModelType(tier);
      const maxTokens = getTokenLimit(tier);

      setProgress(50);

      // Generate assessment using edge function
      const startTime = Date.now();
      const response = await supabase.functions.invoke('generate-skill-assessment', {
        body: {
          ...params,
          modelType,
          maxTokens,
        }
      });

      const generationTime = Date.now() - startTime;
      
      setProgress(80);

      // Cache the result for future use
      if (!response.error && response.data?.assessment) {
        // Calculate cache duration based on tier
        const cacheDuration = tier === 'free' ? 30 : 7; // days
        const cachedUntil = new Date();
        cachedUntil.setDate(cachedUntil.getDate() + cacheDuration);

        // Store in cache
        await supabase.from('cached_assessments').insert({
          cache_key: cacheKey,
          assessment_data: response.data.assessment,
          cached_until: cachedUntil.toISOString(),
          model_used: modelType,
          generation_time: generationTime,
        });

        // Track analytics
        await supabase.from('assessment_analytics').insert({
          user_id: user.id,
          model_used: modelType,
          generation_time: generationTime,
          token_usage: response.data.token_usage || 0,
          user_tier: tier,
        });
      }

      // Track completion
      await trackFeatureInteraction('skill-assessment-generation', 'complete');
      
      setProgress(100);
      return response.data?.assessment;
    } catch (error) {
      console.error('Error generating assessment:', error);
      await trackFeatureInteraction('skill-assessment-generation', 'error');
      toast({
        title: "Generation failed",
        description: "There was a problem creating your skill assessment. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAssessment,
    isGenerating,
    progress,
    checkAssessmentAllowance
  };
};
