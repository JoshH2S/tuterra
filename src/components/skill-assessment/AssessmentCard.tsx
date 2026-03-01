
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
    <Card className="h-full border border-black/[0.06] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] touch-manipulation w-full">
      <CardHeader className="pb-4 sm:pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold line-clamp-1 leading-tight">
              {assessment.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500">
              <Building2 className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
              {assessment.industry}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs sm:text-sm whitespace-nowrap self-start">
            {assessment.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-5 sm:pb-6">
        <div className="space-y-4 sm:space-y-5">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {skills.slice(0, isMobile ? 2 : 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="bg-gray-50 text-gray-600 border-gray-200 text-xs truncate max-w-[120px]"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > (isMobile ? 2 : 3) && (
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                +{skills.length - (isMobile ? 2 : 3)} more
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">
                {previousScore !== null ? "Previous Score" : "Questions"}
              </span>
              <span className="font-medium text-gray-700">
                {previousScore !== null 
                  ? `${previousScore}%`
                  : `${assessment.questions?.length || 0} total`}
              </span>
            </div>
            <Progress 
              value={previousScore !== null ? previousScore : 0} 
              className="h-1.5 bg-black/5"
              indicatorClassName="bg-[#B8860B]"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-1 sm:pt-2 flex gap-2">
        {previousScore !== null && (
          <Button 
            variant="outline" 
            className="text-xs sm:text-sm flex-1 px-3 rounded-full"
            onClick={handleViewResults}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View Results
          </Button>
        )}
        <Button 
          className={`text-xs sm:text-sm rounded-full text-black bg-gradient-to-br from-[#FFF8DC]/90 to-[#FFE4B5]/90 border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_25px_rgba(184,134,11,0.18)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(184,134,11,0.26)] transition-all ${previousScore !== null ? 'flex-1 px-3' : 'w-full'}`}
          onClick={() => onViewAssessment(assessment.id)}
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          {previousScore !== null ? "Take Again" : "Take Assessment"}
        </Button>
      </CardFooter>
    </Card>
  );
};
