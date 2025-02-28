
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Award, ChevronLeft } from "lucide-react";

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
  created_at: string;
};

type Assessment = {
  id: string;
  title: string;
  description: string;
  industry: string;
  role: string;
  questions: any[];
};

export default function SkillAssessmentResults() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id || !user) return;

      try {
        // Fetch the result
        const { data: resultData, error: resultError } = await supabase
          .from("skill_assessment_results")
          .select("*, assessment_id")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (resultError) throw resultError;
        setResult(resultData as AssessmentResult);

        // Fetch the assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("skill_assessments")
          .select("*")
          .eq("id", resultData.assessment_id)
          .single();

        if (assessmentError) throw assessmentError;
        setAssessment(assessmentData as Assessment);
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

  // Group results by skill
  const skillResults: Record<string, { correct: number, total: number }> = {};
  
  (result.detailed_results || []).forEach((item) => {
    const skill = item.skill || "General";
    if (!skillResults[skill]) {
      skillResults[skill] = { correct: 0, total: 0 };
    }
    skillResults[skill].total += 1;
    if (item.correct) {
      skillResults[skill].correct += 1;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
            <CardDescription>{assessment.title}</CardDescription>
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

            <div className="mt-6">
              <h3 className="font-medium mb-3">Skill Performance</h3>
              <div className="space-y-3">
                {Object.entries(skillResults).map(([skill, data]) => {
                  const skillScore = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={skill} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{skill}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({data.correct}/{data.total})
                        </span>
                      </div>
                      <span className={getScoreColor(skillScore)}>
                        {skillScore}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
