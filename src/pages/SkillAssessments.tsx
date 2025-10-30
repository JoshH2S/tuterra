
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isCreating, setIsCreating] = useState(false);
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
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image - Full Opacity */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters/skill%20assessment.jpg')"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8 w-full">
      {!isCreating && (
        <AssessmentHero onCreateNew={handleCreateNew} />
      )}

      {isCreating ? (
        <MultiStepAssessmentForm 
          onComplete={handleAssessmentComplete}
          onCancel={handleCancel}
          isLoading={isGenerating}
          progress={progress}
        />
      ) : (
        <>
          <AssessmentSearch searchQuery={searchQuery} onSearch={handleSearch} />

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
    </div>
  );
}
