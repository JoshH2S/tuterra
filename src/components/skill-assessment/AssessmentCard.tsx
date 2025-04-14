
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { Building2, FileText, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface AssessmentCardProps {
  assessment: {
    id: string;
    title: string;
    industry: string;
    role: string;
    questions?: { skill: string }[];
  };
  onViewAssessment: (id: string) => void;
}

export const AssessmentCard = ({ assessment, onViewAssessment }: AssessmentCardProps) => {
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [latestResultId, setLatestResultId] = useState<string | null>(null);
  const { user } = useAuth();
  const skills = assessment.questions?.map(q => q.skill).filter((value, index, self) => 
    value && self.indexOf(value) === index
  ) || [];
  
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchPreviousScore = async () => {
      if (!user || !assessment.id) return;
      
      try {
        const { data } = await supabase
          .from("skill_assessment_results")
          .select("id, score")
          .eq("assessment_id", assessment.id)
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(1);
          
        if (data && data.length > 0) {
          setPreviousScore(data[0].score);
          setLatestResultId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching previous score:", error);
      }
    };
    
    fetchPreviousScore();
  }, [assessment.id, user]);
  
  const handleViewResults = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (latestResultId) {
      window.location.href = `/assessments/skill-assessment-results/${latestResultId}`;
    }
  };
  
  return (
    <Card className="h-full transition-all hover:shadow-md active:scale-[0.98] touch-manipulation w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold line-clamp-1">
              {assessment.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
              <Building2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              {assessment.industry}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm whitespace-nowrap self-start">
            {assessment.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4 sm:pb-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {skills.slice(0, isMobile ? 2 : 3).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs truncate max-w-[120px]"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > (isMobile ? 2 : 3) && (
              <Badge variant="secondary" className="text-xs">
                +{skills.length - (isMobile ? 2 : 3)} more
              </Badge>
            )}
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">
                {previousScore !== null ? "Previous Score" : "Questions"}
              </span>
              <span className="font-medium">
                {previousScore !== null 
                  ? `${previousScore}%`
                  : `${assessment.questions?.length || 0} total`}
              </span>
            </div>
            <Progress 
              value={previousScore !== null ? previousScore : 0} 
              className="h-1.5 sm:h-2"
              indicatorClassName={`${previousScore !== null ? 'bg-primary' : 'bg-primary/80'}`}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-1 sm:pt-2 flex gap-2">
        {previousScore !== null && (
          <Button 
            variant="outline" 
            className="text-xs sm:text-sm py-1 sm:py-2 flex-1 px-3"
            onClick={handleViewResults}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View Results
          </Button>
        )}
        <Button 
          variant={previousScore !== null ? "outline" : "default"} 
          className={`text-xs sm:text-sm py-1 sm:py-2 ${previousScore !== null ? 'flex-1 px-3' : 'w-full'}`}
          onClick={() => onViewAssessment(assessment.id)}
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          {previousScore !== null ? "Take Again" : "Take Assessment"}
        </Button>
      </CardFooter>
    </Card>
  );
};
