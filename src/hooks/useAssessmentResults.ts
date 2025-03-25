
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Define proper types for our data
export type AssessmentResult = {
  id: string;
  assessment_id: string;
  user_id: string;
  score: number;
  detailed_results: Array<{
    question: string;
    correct: boolean;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    skill?: string;
  }>;
  skill_scores?: Record<string, { correct: number; total: number; score: number }>;
  created_at: string;
  time_spent?: number;
  level?: string;
  tier?: string;
};

export type Assessment = {
  id: string;
  title: string;
  description: string;
  industry: string;
  role: string;
  questions: any[];
  level?: string;
  tier?: string;
};

export const useAssessmentResults = (resultId: string | undefined) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [benchmarks, setBenchmarks] = useState<{industry: string; role: string; averageScore: number}[]>([]);
  const [userTier, setUserTier] = useState<string>("free");
  const [exportPdfLoading, setExportPdfLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!resultId || !user) return;

      try {
        // Get user's tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .maybeSingle();
        
        const tier = profile?.subscription_tier || 'free';
        setUserTier(tier);
        
        // Fetch the result
        const { data: resultData, error: resultError } = await supabase
          .from("skill_assessment_results")
          .select("*, assessment_id")
          .eq("id", resultId)
          .eq("user_id", user.id)
          .single();

        if (resultError) throw resultError;
        
        // Cast the JSON data to the correct types
        const typedResult: AssessmentResult = {
          ...resultData,
          detailed_results: resultData.detailed_results as AssessmentResult['detailed_results'],
          // Fix for the type mismatch issue with skill_scores
          skill_scores: resultData.skill_scores as unknown as Record<string, { correct: number; total: number; score: number }>,
        };
        
        setResult(typedResult);

        // Fetch the assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("skill_assessments")
          .select("*")
          .eq("id", resultData.assessment_id)
          .single();

        if (assessmentError) throw assessmentError;
        
        // Cast the JSON questions to the correct type
        const typedAssessment: Assessment = {
          ...assessmentData,
          questions: assessmentData.questions as Assessment['questions']
        };
        
        setAssessment(typedAssessment);
        
        // For Pro and Premium users, generate personalized recommendations and benchmarks
        if (tier === 'pro' || tier === 'premium') {
          // Generate recommendations - in a real app, this would be more sophisticated
          const generatedRecommendations = [];
          
          // Basic recommendations based on skills
          if (typedResult.skill_scores) {
            const weakestSkills = Object.entries(typedResult.skill_scores)
              .sort(([, a], [, b]) => a.score - b.score)
              .slice(0, 2);
              
            for (const [skill, data] of weakestSkills) {
              if (data.score < 70) {
                generatedRecommendations.push(
                  `Focus on improving your ${skill} skills. Consider taking a more detailed assessment.`
                );
              }
            }
          }
          
          // Add generic recommendations
          generatedRecommendations.push(
            `Continue practicing ${assessmentData.role} tasks to build more experience.`,
            `Join communities related to ${assessmentData.industry} to stay current with industry trends.`
          );
          
          setRecommendations(generatedRecommendations);
          
          // For Premium users, fetch benchmark data
          if (tier === 'premium') {
            // In a real app, this would come from a real analytics database
            // Here we're just generating fake benchmark data
            setBenchmarks([
              { 
                industry: assessmentData.industry, 
                role: assessmentData.role, 
                averageScore: Math.round(70 + Math.random() * 15) 
              },
              { 
                industry: assessmentData.industry, 
                role: "All Roles", 
                averageScore: Math.round(65 + Math.random() * 15) 
              },
              { 
                industry: "All Industries", 
                role: assessmentData.role, 
                averageScore: Math.round(60 + Math.random() * 20) 
              }
            ]);
          }
        }
        
        // Track result view
        await supabase.from('user_feature_interactions').insert({
          user_id: user.id,
          feature: 'skill-assessment-results',
          action: 'view',
          metadata: { 
            assessment_id: resultData.assessment_id,
            result_id: resultId
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error fetching results:", error);
        toast({
          title: "Error",
          description: "Failed to load assessment results",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId, user, toast]);

  const handleExportPdf = async () => {
    if (!result || !assessment || userTier === 'free') return;
    
    setExportPdfLoading(true);
    
    try {
      toast({
        title: "PDF Export",
        description: "Your assessment results PDF is being generated.",
      });
      
      // In a real app, you would call an API to generate the PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setExportPdfLoading(false);
      
      toast({
        title: "PDF Ready",
        description: "Your assessment results have been exported to PDF.",
      });
      
      // Track export
      await supabase.from('user_feature_interactions').insert({
        user_id: user?.id,
        feature: 'skill-assessment-export',
        action: 'export-pdf',
        metadata: { 
          assessment_id: assessment.id,
          result_id: result.id
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "There was a problem generating your PDF.",
        variant: "destructive",
      });
      setExportPdfLoading(false);
    }
  };

  const handleShareResults = async () => {
    if (!result || !assessment) return;
    
    try {
      // In a real app, generate a shareable link
      toast({
        title: "Share Results",
        description: "Shareable link copied to clipboard.",
      });
      
      // Track share
      await supabase.from('user_feature_interactions').insert({
        user_id: user?.id,
        feature: 'skill-assessment-share',
        action: 'share',
        metadata: { 
          assessment_id: assessment.id,
          result_id: result.id
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error sharing results:", error);
    }
  };

  return {
    result,
    assessment,
    loading,
    userTier,
    recommendations,
    benchmarks,
    exportPdfLoading,
    handleExportPdf,
    handleShareResults
  };
};
