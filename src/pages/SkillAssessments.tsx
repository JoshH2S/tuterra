
import { useState } from "react";
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
import { Plus, Search, Building2 } from "lucide-react";

// Create the AssessmentCard component
const AssessmentCard = ({ assessment, onViewAssessment }) => {
  const skills = assessment.questions?.map(q => q.skill).filter((value, index, self) => 
    value && self.indexOf(value) === index
  ) || [];
  
  const completionRate = Math.floor(Math.random() * 100); // In a real app, this would come from user progress data
  
  return (
    <Card className="h-full transition-all hover:shadow-md active:scale-[0.98] touch-manipulation">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {assessment.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Building2 className="h-3.5 w-3.5" />
              {assessment.industry}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {assessment.role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <div className="space-y-4">
          {/* Skills Preview */}
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Questions</span>
              <span className="font-medium">
                {assessment.questions?.length || 0} total
              </span>
            </div>
            <Progress 
              value={completionRate} 
              className="h-2"
              indicatorClassName="bg-primary/80"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onViewAssessment(assessment.id)}
        >
          Take Assessment
        </Button>
      </CardFooter>
    </Card>
  );
};

// Decorative element component
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

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleViewAssessment = (id: string) => {
    navigate(`/take-skill-assessment/${id}`);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 space-y-6 md:space-y-8">
      {/* Hero Section */}
      {!isCreating && (
        <section className="relative">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-xl sm:rounded-3xl p-6 md:p-10">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Skill Assessments</h1>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base text-muted-foreground">
                Track your professional growth with AI-powered skill assessments tailored to your industry.
              </p>
              <Button className="mt-4 sm:mt-6" size="sm" onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assessment
              </Button>
            </div>
            
            {/* Decorative Elements - Only shown on larger screens */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block">
              <AssessmentStatsPreview />
            </div>
          </div>
        </section>
      )}

      {isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Skill Assessment</CardTitle>
            <CardDescription>
              Define the industry and role to generate a relevant skill assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillAssessmentForm onCancel={handleCancel} />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                className="pl-9"
                onChange={handleSearch}
                value={searchQuery}
              />
            </div>
          </section>

          {/* Replace standard list with customized grid of assessment cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
