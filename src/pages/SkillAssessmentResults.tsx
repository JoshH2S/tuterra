
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Award, ChevronLeft, Download, Share, ArrowUpRight, Lock } from "lucide-react";
import { AssessmentProgressTracker } from "@/components/skill-assessment/AssessmentProgress";
import { PremiumFeature, AdvancedAnalysisSection } from "@/components/skill-assessment/PremiumFeatures";
import { Json } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define proper types for our data
type AssessmentResult = {
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

type Assessment = {
  id: string;
  title: string;
  description: string;
  industry: string;
  role: string;
  questions: any[];
  level?: string;
  tier?: string;
};

export default function SkillAssessmentResults() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [benchmarks, setBenchmarks] = useState<{industry: string; role: string; averageScore: number}[]>([]);
  const [userTier, setUserTier] = useState<string>("free");
  const [exportPdfLoading, setExportPdfLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id || !user) return;

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
          .eq("id", id)
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
            result_id: id
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
  }, [id, user, toast]);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  
  // Format time display
  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Prepare sections for progress tracker
  const getSections = () => {
    if (!result?.skill_scores) return [];
    
    return Object.entries(result.skill_scores).map(([skill, data]) => ({
      id: skill,
      label: skill,
      weight: data.total / (result.detailed_results.length || 1),
      score: data.score
    }));
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result || !assessment) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Results not found</h2>
            <p className="mb-4">The assessment results you're looking for don't exist or you don't have access to them.</p>
            <Button onClick={() => navigate("/skill-assessments")}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate("/skill-assessments")}
        className="mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Assessments
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{assessment.title} Results</h1>
          <p className="text-muted-foreground">
            Completed on {new Date(result.created_at).toLocaleDateString()}
            {result.level && ` • ${result.level.charAt(0).toUpperCase() + result.level.slice(1)} level`}
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportPdf}
                    disabled={userTier === 'free' || exportPdfLoading}
                    className="relative"
                  >
                    {exportPdfLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export PDF
                    {userTier === 'free' && (
                      <Lock className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              {userTier === 'free' && (
                <TooltipContent>
                  <p>Upgrade to Pro or Premium to export results</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShareResults}
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button
            size="sm"
            onClick={() => navigate(`/take-skill-assessment/${assessment.id}`)}
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Retake Assessment
          </Button>
        </div>
      </div>

      <div className="md:grid md:grid-cols-3 gap-6">
        {/* Left column: Summary */}
        <div className="mb-6 md:mb-0">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Your assessment performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative">
                  <Award className="h-24 w-24 text-primary opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}%
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-center text-muted-foreground">
                  {result.score >= 80 ? (
                    "Excellent! You've demonstrated strong skills in this assessment."
                  ) : result.score >= 60 ? (
                    "Good job! You've shown competency with room for improvement."
                  ) : (
                    "This area needs more practice. Consider reviewing the topics."
                  )}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <AssessmentProgressTracker 
                  sections={getSections()}
                  showScores={true}
                />
                
                <div className="pt-4 border-t flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Time spent</p>
                    <p className="font-medium">{formatTime(result.time_spent)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Questions</p>
                    <p className="font-medium">{result.detailed_results.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p className="font-medium capitalize">{result.level || "Intermediate"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Details/Analysis */}
        <div className="md:col-span-2">
          <Tabs defaultValue="questions">
            <TabsList className="mb-4">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="analysis">
                Advanced Analysis
                {userTier === 'free' && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                  <CardDescription>Question by question breakdown</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                  <div className="space-y-6">
                    {(result.detailed_results || []).map((item, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-2">
                          {item.correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{item.question}</p>
                            <div className="mt-2 text-sm">
                              <p>
                                <span className="text-muted-foreground">Your answer: </span>
                                <span className={item.correct ? "text-green-600" : "text-red-600"}>
                                  {Array.isArray(item.userAnswer) 
                                    ? item.userAnswer.join(", ") 
                                    : item.userAnswer || "No answer"}
                                </span>
                              </p>
                              {!item.correct && (
                                <p className="mt-1">
                                  <span className="text-muted-foreground">Correct answer: </span>
                                  <span className="text-green-600">
                                    {Array.isArray(item.correctAnswer) 
                                      ? item.correctAnswer.join(", ") 
                                      : item.correctAnswer}
                                  </span>
                                </p>
                              )}
                            </div>
                            {item.skill && (
                              <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {item.skill}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analysis">
              {/* Premium analysis content */}
              <AdvancedAnalysisSection 
                userTier={userTier}
                skills={
                  result.skill_scores 
                    ? Object.entries(result.skill_scores).map(([name, data]) => ({
                        name,
                        score: data.score
                      }))
                    : []
                }
                recommendations={recommendations}
                benchmarks={benchmarks}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
