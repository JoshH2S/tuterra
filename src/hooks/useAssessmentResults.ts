
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

// Define an interface for skill benchmark data
interface SkillBenchmark {
  skill_name: string;
  benchmark_score: number;
  role: string;
  industry: string;
}

export const useAssessmentResults = (resultId: string | undefined) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [userTier, setUserTier] = useState("free");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [skillBenchmarks, setSkillBenchmarks] = useState<Record<string, number>>({});
  const [exportPdfLoading, setExportPdfLoading] = useState(false);

  useEffect(() => {
    if (!resultId || !user) return;
    
    const fetchResult = async () => {
      setLoading(true);
      try {
        // Fetch result
        const { data, error } = await supabase
          .from("skill_assessment_results")
          .select("*, assessment:assessment_id(*)")
          .eq("id", resultId)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error("Result not found");
        
        // Check ownership
        if (data.user_id !== user.id) {
          throw new Error("You don't have access to this result");
        }
        
        setResult(data);
        setAssessment(data.assessment);
        
        // Fetch user tier
        const { data: userData } = await supabase
          .from("profiles")
          .select("subscription_tier")
          .eq("id", user.id)
          .single();
          
        if (userData?.subscription_tier) {
          setUserTier(userData.subscription_tier);
        }
        
        // Generate recommendations based on results
        generateRecommendations(data);
        
        // Fetch benchmarks using the new edge function
        if (data.assessment?.role && data.assessment?.industry) {
          try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-industry-benchmarks`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                role: data.assessment.role,
                industry: data.assessment.industry
              })
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch benchmarks: ${response.statusText}`);
            }
            
            const benchmarkData = await response.json();
            
            if (benchmarkData.benchmarks) {
              setBenchmarks(benchmarkData.benchmarks);
            }
            
            if (benchmarkData.skillBenchmarks) {
              setSkillBenchmarks(benchmarkData.skillBenchmarks);
            }
          } catch (benchmarkError) {
            console.error("Error fetching industry benchmarks:", benchmarkError);
            // Fall back to fetching local benchmarks
            fetchLocalBenchmarks(data);
          }
        } else {
          // Fall back to fetching local benchmarks
          fetchLocalBenchmarks(data);
        }
      } catch (error) {
        console.error("Error fetching assessment result:", error);
        toast({
          title: "Error",
          description: "Could not load assessment results",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [resultId, user, toast]);
  
  // Fallback method to fetch and calculate benchmarks locally
  const fetchLocalBenchmarks = async (data: any) => {
    try {
      // Fetch benchmarks
      const { data: benchmarkData } = await supabase
        .from("skill_assessment_results")
        .select("score, skill_scores, completed_at")
        .eq("assessment_id", data.assessment_id)
        .order("completed_at", { ascending: false })
        .limit(100);
        
      if (benchmarkData) {
        setBenchmarks([{
          industry: data.assessment?.industry || 'General',
          role: data.assessment?.role || 'Professional',
          averageScore: Math.round(
            benchmarkData.reduce((sum, item) => sum + item.score, 0) / benchmarkData.length
          )
        }]);
        
        // Calculate skill benchmarks
        const skillScores: Record<string, number[]> = {};
        
        benchmarkData.forEach(result => {
          if (result.skill_scores) {
            Object.entries(result.skill_scores).forEach(([skill, scoreData]: [string, any]) => {
              if (!skillScores[skill]) {
                skillScores[skill] = [];
              }
              skillScores[skill].push(scoreData.score);
            });
          }
        });
        
        const calculatedBenchmarks: Record<string, number> = {};
        Object.entries(skillScores).forEach(([skill, scores]) => {
          calculatedBenchmarks[skill] = Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          );
        });
        
        setSkillBenchmarks(calculatedBenchmarks);
      }
    } catch (benchmarkError) {
      console.error("Error fetching local benchmarks:", benchmarkError);
    }
  };
  
  // Generate recommendations based on skill scores
  const generateRecommendations = (resultData: any) => {
    if (!resultData?.skill_scores) return [];
    
    const weakAreas = Object.entries(resultData.skill_scores)
      .filter(([_, data]: [string, any]) => data.score < 70)
      .map(([skill]: [string, any]) => skill);
      
    const recommendations = weakAreas.map(skill => 
      `Improve your knowledge in ${skill} by focusing on practical exercises and case studies.`
    );
    
    if (recommendations.length === 0) {
      recommendations.push("Great job! Consider exploring advanced topics to further enhance your skills.");
    }
    
    setRecommendations(recommendations);
  };
  
  // Export results as PDF
  const handleExportPdf = async () => {
    if (!result || !assessment) return;
    
    setExportPdfLoading(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(`Skill Assessment Results: ${assessment.title}`, 20, 20);
      
      // Add date and score
      doc.setFontSize(12);
      const date = new Date(result.created_at).toLocaleDateString();
      doc.text(`Completed on: ${date}`, 20, 30);
      doc.text(`Overall Score: ${result.score}%`, 20, 40);
      
      // Add skill scores
      doc.text("Skill Performance:", 20, 55);
      let yPos = 65;
      
      Object.entries(result.skill_scores || {}).forEach(([skill, data]: [string, any]) => {
        doc.text(`${skill}: ${data.score}% (${data.correct}/${data.total})`, 25, yPos);
        yPos += 10;
      });
      
      // Add recommendations
      doc.text("Recommendations:", 20, yPos + 10);
      yPos += 20;
      
      recommendations.forEach(recommendation => {
        doc.text(`• ${recommendation}`, 25, yPos);
        yPos += 10;
      });
      
      doc.save(`skill-assessment-${assessment.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: "Success",
        description: "Results exported to PDF",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: "Failed to export results",
        variant: "destructive",
      });
    } finally {
      setExportPdfLoading(false);
    }
  };
  
  // Share results (could be expanded to email or social sharing)
  const handleShareResults = () => {
    if (!resultId) return;
    
    const shareUrl = `${window.location.origin}/assessments/skill-assessment-results/${resultId}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Assessment results link copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Could not copy link",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast({
          title: "Link copied",
          description: "Assessment results link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Could not copy link. Please copy it manually.",
          variant: "destructive",
        });
      }
      
      document.body.removeChild(textArea);
    }
  };
  
  // Retake assessment
  const handleRetakeAssessment = () => {
    if (!assessment) return;
    
    navigate(`/assessments/take-skill-assessment/${assessment.id}`);
  };
  
  return {
    result,
    assessment,
    loading,
    userTier,
    recommendations,
    benchmarks,
    skillBenchmarks,
    exportPdfLoading,
    handleExportPdf,
    handleShareResults,
    handleRetakeAssessment
  };
};
