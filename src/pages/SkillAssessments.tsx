import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SkillAssessmentForm } from "@/components/skill-assessment/SkillAssessmentForm";
import { SkillAssessmentsList } from "@/components/skill-assessment/SkillAssessmentsList";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Building2, FileText, Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AssessmentCard = ({ assessment, onViewAssessment }) => {
  const [previousScore, setPreviousScore] = useState(null);
  const [latestResultId, setLatestResultId] = useState(null);
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
  
  const handleViewResults = (e) => {
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

const AssessmentStatsPreview = () => (
  <div className="rounded-xl bg-card p-4 shadow-sm border w-[240px]">
    <div className="space-y-2">
      <div className="h-2 w-24 bg-primary/20 rounded-full" />
      <div className="h-2 w-32 bg-muted rounded-full" />
      <div className="h-2 w-16 bg-muted rounded-full" />
      <div className="h-8 mt-4 bg-muted/50 rounded-md" />
    </div>
  </div>
);

export default function SkillAssessments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleViewAssessment = (id: string) => {
    navigate(`/assessments/take-skill-assessment/${id}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8 w-full">
      {!isCreating && (
        <section className="relative">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg sm:rounded-xl md:rounded-3xl p-4 sm:p-6 md:p-10 w-full">
            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Skill Assessments</h1>
              <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-muted-foreground">
                Track your professional growth with AI-powered skill assessments tailored to your industry.
              </p>
              <Button className="mt-3 sm:mt-4 md:mt-6" size={isMobile ? "sm" : "default"} onClick={handleCreateNew}>
                <Plus className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Create Assessment
              </Button>
            </div>
            
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
              <AssessmentStatsPreview />
            </div>
          </div>
        </section>
      )}

      {isCreating ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Create Skill Assessment</CardTitle>
            <CardDescription className="text-sm">
              Define the industry and role to generate a relevant skill assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillAssessmentForm onCancel={handleCancel} />
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                className="pl-8 sm:pl-9 w-full text-sm"
                onChange={handleSearch}
                value={searchQuery}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
            <SkillAssessmentsList 
              onViewAssessment={handleViewAssessment} 
              searchQuery={searchQuery}
              renderItem={(assessment) => (
                <AssessmentCard 
                  key={assessment.id} 
                  assessment={assessment} 
                  onViewAssessment={handleViewAssessment} 
                />
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
