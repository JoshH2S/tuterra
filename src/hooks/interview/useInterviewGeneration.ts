
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserCredits } from '@/hooks/useUserCredits';
import { useNetworkStatus } from '@/hooks/interview/useNetworkStatus';
import { InterviewQuestion } from '@/types/interview';
import { generateQuestionsFromApi } from './utils/apiQuestions';
import { generateFallbackQuestions } from './utils/fallbackQuestions';

// Types for interview parameters
export interface InterviewGenerationParams {
  industry: string;
  jobTitle: string;
  jobDescription: string;
}

// Hook for handling interview generation
export const useInterviewGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { decrementCredits, checkCredits, fetchUserCredits } = useUserCredits();
  const { isOnline } = useNetworkStatus();

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

  // Check if user can generate an interview based on their tier and credits
  const checkInterviewAllowance = async () => {
    if (!user) return false;
    
    try {
      console.log('Checking interview allowance for user', user.id);
      
      // Always refresh credits first to ensure we have the latest data
      await fetchUserCredits();
      
      // Get user's subscription tier
      const tier = await getUserTier();
      console.log('User tier:', tier);
      
      // Premium users have unlimited interviews
      if (tier === 'premium') {
        console.log('Premium user has unlimited interviews');
        return true;
      }
      
      // For free and pro users, check if they have interview credits
      const hasCredits = await checkCredits('interview_credits');
      console.log('User has interview credits:', hasCredits);
      
      return hasCredits;
    } catch (error) {
      console.error('Error checking interview allowance:', error);
      return false;
    }
  };

  // Generate interview questions with improved error handling and retries
  const generateInterview = async (params: InterviewGenerationParams): Promise<{
    questions: InterviewQuestion[];
    sessionId: string;
  } | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate interview questions",
        variant: "destructive",
      });
      return null;
    }

    // Validate input parameters
    if (!params.industry || !params.jobTitle) {
      toast({
        title: "Missing information",
        description: "Industry and job title are required fields",
        variant: "destructive",
      });
      return null;
    }

    // Check if user can generate an interview
    const canGenerate = await checkInterviewAllowance();
    if (!canGenerate) {
      toast({
        title: "Interview limit reached",
        description: "You've used all your interview credits. Upgrade your subscription for more.",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);
    setProgress(10);

    try {
      // Track usage before generation
      await trackFeatureInteraction('interview-generation', 'start');
      
      // Create a new interview session
      const { data: session, error: sessionError } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          job_title: params.jobTitle.trim(),
          industry: params.industry.trim(),
          job_description: params.jobDescription.trim(),
          status: "created",
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Database error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        throw new Error("Failed to create interview session");
      }

      setProgress(30);
      console.log("Interview session created:", session.id);
      
      // Add a small delay to ensure session is propagated in the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let questions: InterviewQuestion[] = [];
      
      // Get user's subscription tier
      const tier = await getUserTier();

      setProgress(50);

      try {
        // Generate questions using API or fallbacks based on connectivity
        if (isOnline) {
          // Try to generate questions with retry logic
          const maxRetries = 3;
          let lastError = null;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`Attempt ${attempt} of ${maxRetries} to generate questions`);
              questions = await generateQuestionsFromApi({
                sessionId: session.id,
                industry: params.industry,
                jobRole: params.jobTitle,
                jobDescription: params.jobDescription
              }, (error) => {
                console.error(`API generation error (attempt ${attempt}):`, error);
                lastError = error;
              });
              
              if (questions && questions.length > 0) {
                console.log(`Successfully generated ${questions.length} questions on attempt ${attempt}`);
                break; // Success, exit retry loop
              }
            } catch (genError) {
              console.error(`Error generating questions on attempt ${attempt}:`, genError);
              lastError = genError;
              
              if (attempt < maxRetries) {
                // Wait before retry with exponential backoff
                const delay = 1000 * Math.pow(1.5, attempt - 1);
                console.log(`Waiting ${delay}ms before retry`);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            }
          }
          
          // If all retries failed, throw the last error
          if (!questions || questions.length === 0) {
            throw lastError || new Error("Failed to generate questions after multiple attempts");
          }
        } else {
          // In offline mode, use fallback generator
          questions = await generateFallbackQuestions(
            params.jobTitle,
            params.industry,
            session.id
          );
        }
      } catch (genError) {
        console.error("Error generating questions:", genError);
        // Attempt to use fallbacks on API failure
        questions = await generateFallbackQuestions(
          params.jobTitle,
          params.industry,
          session.id
        );
      }
      
      setProgress(80);

      // Decrement the interview credits after successful generation
      // Skip decrementing for premium users who have unlimited
      if (tier !== 'premium') {
        await decrementCredits('interview_credits');
      }

      // Track completion
      await trackFeatureInteraction('interview-generation', 'complete');
      
      setProgress(100);
      return { 
        questions, 
        sessionId: session.id 
      };
    } catch (error) {
      console.error('Error generating interview:', error);
      await trackFeatureInteraction('interview-generation', 'error');
      toast({
        title: "Generation failed",
        description: "There was a problem creating your interview. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateInterview,
    isGenerating,
    progress,
    checkInterviewAllowance
  };
};
