
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SkillAssessmentForm } from "@/components/skill-assessment/SkillAssessmentForm";
import { SkillAssessmentsList } from "@/components/skill-assessment/SkillAssessmentsList";
import { supabase } from "@/integrations/supabase/client";

export default function SkillAssessments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleViewAssessment = (id: string) => {
    navigate(`/take-skill-assessment/${id}`);
  };

  return (
    <div className="container py-6 space-y-6 md:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Assessments</h1>
          <p className="text-muted-foreground mt-1">
            Create and take assessments to test job-specific skills
          </p>
        </div>
        {!isCreating && (
          <Button onClick={handleCreateNew}>
            Create New Assessment
          </Button>
        )}
      </div>

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
        <SkillAssessmentsList onViewAssessment={handleViewAssessment} />
      )}
    </div>
  );
}
