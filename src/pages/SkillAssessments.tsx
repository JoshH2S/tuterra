
import React, { useState } from "react";
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
import AssessmentCard from "@/components/skill-assessment/AssessmentCard";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Building2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleViewAssessment = (id: string) => {
    // Update navigation path to include the /assessments/ prefix
    navigate(`/assessments/take-skill-assessment/${id}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8 w-full">
      {/* Hero Section */}
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
            
            {/* Decorative Elements - Only shown on larger screens */}
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
          {/* Search */}
          <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                className="pl-8 sm:pl-9 w-full text-sm"
                onChange={handleSearch}
                value={searchQuery}
                aria-label="Search skill assessments"
              />
            </div>
          </section>

          {/* Replace standard list with customized grid of assessment cards */}
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
