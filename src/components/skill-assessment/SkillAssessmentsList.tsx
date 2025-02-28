
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Award } from "lucide-react";

type SkillAssessment = {
  id: string;
  title: string;
  industry: string;
  role: string;
  created_at: string;
  questions: any[];
  description: string;
};

interface SkillAssessmentsListProps {
  onViewAssessment: (id: string) => void;
}

export function SkillAssessmentsList({ onViewAssessment }: SkillAssessmentsListProps) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("skill_assessments")
          .select("*")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAssessments(data || []);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No assessments found</h3>
        <p className="mt-2 text-muted-foreground">
          Create your first skill assessment to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assessments.map((assessment) => (
        <Card key={assessment.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{assessment.title}</h3>
              <div className="flex flex-wrap gap-1 mb-4">
                <span className="bg-primary-foreground text-primary-foreground bg-opacity-10 px-2 py-1 rounded text-xs">
                  {assessment.industry}
                </span>
                <span className="bg-primary-foreground text-primary-foreground bg-opacity-10 px-2 py-1 rounded text-xs">
                  {assessment.role}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {assessment.description || "Test your skills in this assessment"}
              </p>
              <p className="text-sm mb-4">
                {assessment.questions?.length || 0} questions
              </p>
              <Button
                onClick={() => onViewAssessment(assessment.id)}
                className="w-full"
              >
                View Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
