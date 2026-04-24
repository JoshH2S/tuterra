
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SkillAssessmentForm } from "@/components/skill-assessment/SkillAssessmentForm";
import { MultiStepAssessmentForm, AssessmentFormData } from "@/components/skill-assessment/MultiStepAssessmentForm";
import { useSkillAssessmentGeneration } from "@/hooks/useSkillAssessmentGeneration";
import { SkillAssessmentsList } from "@/components/skill-assessment/SkillAssessmentsList";
import { AssessmentCard } from "@/components/skill-assessment/AssessmentCard";
import { AssessmentHero } from "@/components/skill-assessment/AssessmentHero";
import { AssessmentSearch } from "@/components/skill-assessment/AssessmentSearch";

export default function SkillAssessments() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { topic?: string; autoCreate?: boolean } | null;
  const [isCreating, setIsCreating] = useState(!!locationState?.autoCreate);
  const [searchQuery, setSearchQuery] = useState("");
  const { generateAssessment, isGenerating, progress } = useSkillAssessmentGeneration();

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleViewAssessment = (id: string) => {
    navigate(`/assessments/take-skill-assessment/${id}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAssessmentComplete = async (data: AssessmentFormData) => {
    try {
      const result = await generateAssessment({
        industry: data.industry,
        role: data.role,
        questionCount: data.questionCount,
        additionalInfo: data.additionalInfo,
        level: data.level as "beginner" | "intermediate" | "advanced"
      });

      if (result?.id) {
        toast({
          title: "Assessment Created!",
          description: "Your skill assessment has been generated successfully.",
        });
        navigate(`/assessments/take-skill-assessment/${result.id}`);
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 left-0 md:left-[200px] z-0 pointer-events-none bg-white" />

      {/* Hero — at page root level, outside the content container */}
      {!isCreating && (
        <AssessmentHero onCreateNew={handleCreateNew} />
      )}

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pb-10">
        {isCreating ? (
          <MultiStepAssessmentForm 
            onComplete={handleAssessmentComplete}
            onCancel={handleCancel}
            isLoading={isGenerating}
            progress={progress}
            initialTopic={locationState?.topic}
            skipIndustry={!!locationState?.autoCreate}
          />
        ) : (
          <>
            <AssessmentSearch searchQuery={searchQuery} onSearch={handleSearch} />

            {/* Section heading — matches Course Engine "CONTINUE LEARNING" eyebrow */}
            <div className="mt-10 mb-6 flex items-center gap-3">
              <h2 className="font-manrope text-sm font-medium uppercase tracking-[0.22em] text-[#9a7f2a]">
                All Assessments
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-[#C8A84B]/50 to-transparent" />
            </div>

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
    </>
  );
}
