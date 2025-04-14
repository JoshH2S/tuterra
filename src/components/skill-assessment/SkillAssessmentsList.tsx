
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Award } from "lucide-react";
import { SkillAssessmentDisplay, SkillAssessmentsListProps } from "./types";

export function SkillAssessmentsList({ 
  onViewAssessment, 
  searchQuery = "",
  renderItem 
}: SkillAssessmentsListProps) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<SkillAssessmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setAssessments(data as SkillAssessmentDisplay[] || []);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        setError("Failed to load assessments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [user]);

  // Filter assessments by search query
  const filteredAssessments = searchQuery
    ? assessments.filter(assessment => 
        assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : assessments;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => {
            setLoading(true);
            setError(null);
            setTimeout(() => fetchAssessments(), 500);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (filteredAssessments.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">
          {searchQuery ? "No matching assessments" : "No assessments found"}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {searchQuery 
            ? "Try adjusting your search terms" 
            : "Create your first skill assessment to get started."}
        </p>
      </div>
    );
  }

  // Use the custom render function if provided, otherwise use default rendering
  if (renderItem) {
    return (
      <>
        {filteredAssessments.map(assessment => renderItem(assessment))}
      </>
    );
  }

  // Default rendering (kept for backward compatibility)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredAssessments.map((assessment) => (
        <div key={assessment.id} onClick={() => onViewAssessment(assessment.id)}>
          {/* Default card rendering here */}
          <div className="border rounded-lg p-4">
            <h3>{assessment.title}</h3>
            <p>{assessment.industry} - {assessment.role}</p>
            <p>{assessment.questions?.length || 0} questions</p>
          </div>
        </div>
      ))}
    </div>
  );
}
