
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserCredits } from '@/hooks/useUserCredits';

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
      return 'gpt-4o';
    case 'pro':
      return 'gpt-4o-mini';
    default:
      return 'gpt-4o-mini';
  }
};

// Get token limit based on subscription tier
const getTokenLimit = (tier: string = 'free') => {
  switch (tier) {
    case 'premium':
      return 8000; // GPT-4o has much higher limits
    case 'pro':
      return 6000; // GPT-4o-mini
    default:
      return 4000; // GPT-4o-mini conservative
  }
};

// Hook for handling assessment generation
export const useSkillAssessmentGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { decrementCredits, checkCredits, isOfflineMode, fetchUserCredits } = useUserCredits();

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

  // Get the user's subscription tier
  const getUserTier = async (): Promise<string> => {
    if (!user) return 'free';
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();
      
      return profile?.subscription_tier || 'free';
    } catch (error) {
      console.error('Error getting user tier:', error);
      return 'free';
    }
  };

  // Get the count of assessments created in the current month
  const getMonthlyAssessmentCount = async (): Promise<number> => {
    if (!user) return 0;
    
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('skill_assessments')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .gte('created_at', startOfMonth.toISOString());
        
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error counting monthly assessments:', error);
      return 0;
    }
  };

  // Get monthly assessment limit based on subscription tier
  const getMonthlyAssessmentLimit = (tier: string): number => {
    switch (tier) {
      case 'premium':
        return Infinity;
      case 'pro':
        return 20;
      default:
        return 2; // Free tier gets 2 assessments
    }
  };

  // Check if user can generate an assessment based on their tier and credits
  const checkAssessmentAllowance = async () => {
    if (!user) return false;
    
    try {
      console.log('Checking assessment allowance for user', user.id);
      
      // Always refresh credits first to ensure we have the latest data
      await fetchUserCredits();
      
      // If we're in offline mode, we'll check the local credits only
      if (isOfflineMode) {
        console.log('In offline mode, checking local credits');
        return await checkCredits('assessment_credits');
      }
      
      // Get user's subscription tier
      const tier = await getUserTier();
      console.log('User tier:', tier);
      
      // Premium users have unlimited assessments
      if (tier === 'premium') {
        console.log('Premium user has unlimited assessments');
        return true;
      }
      
      // For free and pro users, check if they have assessment credits
      const hasCredits = await checkCredits('assessment_credits');
      console.log('User has assessment credits:', hasCredits);
      
      if (!hasCredits) {
        console.log('User has no assessment credits remaining');
        return false;
      }
      
      // If they have credits, also check monthly limits
      const monthlyCount = await getMonthlyAssessmentCount();
      const monthlyLimit = getMonthlyAssessmentLimit(tier);
      
      console.log('Monthly assessment count:', monthlyCount, 'Monthly limit:', monthlyLimit);
      
      // Check if user is within their monthly limit
      if (monthlyCount < monthlyLimit) {
        console.log('User is within monthly assessment limit');
        return true;
      }
      
      console.log('User has reached monthly assessment limit');
      return false;
    } catch (error) {
      console.error('Error checking assessment allowance:', error);
      
      // If we encounter an error, fall back to offline mode
      if (isOfflineMode) {
        return await checkCredits('assessment_credits');
      }
      
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
        description: "You've either reached your monthly limit or used all your assessment credits. Upgrade your subscription for more.",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    setProgress(10);

    try {
      // Track usage before generation
      await trackFeatureInteraction('skill-assessment-generation', 'start');
      
      // Prepare variables used in both cache-hit and fresh generation flows
      let assessmentData: any | null = null;
      let generationTime = 0;

      // Check cache for similar assessment
      const cacheKey = `assessment:${params.industry}:${params.role}:${params.level || 'intermediate'}`;
      const { data: cachedAssessment } = await supabase
        .from('cached_assessments')
        .select('*')
        .eq('cache_key', cacheKey)
        .gt('cached_until', new Date().toISOString())
        .maybeSingle();

      setProgress(30);

      // Get user's subscription tier (needed for either path)
      const tier = await getUserTier();
      const modelType = determineModelType(tier);
      const maxTokens = getTokenLimit(tier);

      if (cachedAssessment && cachedAssessment.assessment_data) {
        // Use cached assessment data but continue to save and navigate
        await trackFeatureInteraction('skill-assessment-generation', 'cache-hit');
        assessmentData = cachedAssessment.assessment_data;
        setProgress(60);
      } else {
        // Generate assessment using edge function
        const startTime = Date.now();
        
        console.log("Calling generate-skill-assessment with params:", {
          industry: params.industry,
          role: params.role,
          additionalInfoLength: params.additionalInfo?.length || 0,
          modelType,
          maxTokens
        });
        
        const response = await supabase.functions.invoke('generate-skill-assessment', {
          body: {
            ...params,
            modelType,
            maxTokens,
          }
        });

        generationTime = Date.now() - startTime;
        
        console.log("Response from generate-skill-assessment:", {
          hasError: !!response.error,
          hasData: !!response.data,
          hasAssessment: !!response.data?.assessment,
          responseTime: generationTime
        });
        
        if (response.error) {
          console.error("Edge function error:", response.error);
          throw new Error(`Failed to generate assessment: ${response.error.message || 'Unknown error'}`);
        }
        
        if (!response.data?.assessment) {
          console.error("No assessment data in response:", response.data);
          throw new Error("No assessment was generated. Please try again.");
        }
        
        setProgress(80);

        assessmentData = response.data.assessment;

        // Cache the result for future use
        try {
          // Calculate cache duration based on tier
          const cacheDuration = tier === 'free' ? 30 : 7; // days
          const cachedUntil = new Date();
          cachedUntil.setDate(cachedUntil.getDate() + cacheDuration);

          await supabase.from('cached_assessments').insert({
            cache_key: cacheKey,
            assessment_data: assessmentData,
            cached_until: cachedUntil.toISOString(),
            model_used: modelType,
            generation_time: generationTime,
          });
        } catch (cacheError) {
          console.error('Error caching assessment:', cacheError);
          // Continue even if caching fails
        }

        try {
          // Track analytics for fresh generations
          await supabase.from('assessment_analytics').insert({
            user_id: user.id,
            model_used: modelType,
            generation_time: generationTime,
            token_usage: response.data.token_usage || 0,
            user_tier: tier,
          });
        } catch (analyticsError) {
          console.error('Error tracking analytics:', analyticsError);
          // Continue even if analytics tracking fails
        }
      }

      // Decrement the assessment credits after successful generation (including cache hits)
      // Skip decrementing for premium users who have unlimited
      if (tier !== 'premium') {
        await decrementCredits('assessment_credits');
      }

      // Track completion
      await trackFeatureInteraction('skill-assessment-generation', 'complete');
      
      setProgress(90);
      
      // Save the assessment to the database
      if (!assessmentData) {
        throw new Error('No assessment data available');
      }
      const { data: savedAssessment, error: saveError } = await supabase
        .from('skill_assessments')
        .insert({
          title: `${params.role} - ${params.industry}`,
          industry: params.industry,
          role: params.role,
          description: assessmentData.description,
          creator_id: user.id,
          questions: assessmentData.questions,
          skills_tested: assessmentData.skills_tested,
          level: params.level || 'intermediate',
          tier: tier,
        })
        .select()
        .single();
      
      if (saveError) {
        console.error('Error saving assessment:', saveError);
        throw new Error('Failed to save assessment to database');
      }
      
      setProgress(100);
      return savedAssessment;
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
    checkAssessmentAllowance,
    getUserTier,
    getMonthlyAssessmentCount
  };
};
