
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SkillAssessmentForm } from "@/components/skill-assessment/SkillAssessmentForm";
import { SkillAssessmentsList } from "@/components/skill-assessment/SkillAssessmentsList";
import { AssessmentCard } from "@/components/skill-assessment/AssessmentCard";
import { AssessmentHero } from "@/components/skill-assessment/AssessmentHero";
import { AssessmentSearch } from "@/components/skill-assessment/AssessmentSearch";

export default function SkillAssessments() {
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
    navigate(`/assessments/take-skill-assessment/${id}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8 w-full">
      {!isCreating && (
        <AssessmentHero onCreateNew={handleCreateNew} />
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
  );
}
