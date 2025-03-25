
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAssessmentResults } from "@/hooks/useAssessmentResults";
import { ResultsHeader } from "@/components/skill-assessment/results/ResultsHeader";
import { ResultsContent } from "@/components/skill-assessment/results/ResultsContent";
import { MobileResultsView } from "@/components/skill-assessment/results/MobileResultsView";

export default function SkillAssessmentResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    result,
    assessment,
    loading,
    userTier,
    recommendations,
    benchmarks,
    exportPdfLoading,
    handleExportPdf,
    handleShareResults
  } = useAssessmentResults(id);

  const handleRetakeAssessment = () => {
    if (assessment) {
      navigate(`/take-skill-assessment/${assessment.id}`);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result || !assessment) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Results not found</h2>
            <p className="mb-4">The assessment results you're looking for don't exist or you don't have access to them.</p>
            <Button onClick={() => navigate("/skill-assessments")}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <ResultsHeader 
        title={assessment.title}
        createdAt={result.created_at}
        level={result.level}
        userTier={userTier}
        exportPdfLoading={exportPdfLoading}
        onExportPdf={handleExportPdf}
        onShareResults={handleShareResults}
        onRetakeAssessment={handleRetakeAssessment}
        assessmentId={assessment.id}
      />

      {isMobile ? (
        <MobileResultsView 
          result={result}
          userTier={userTier}
          recommendations={recommendations}
          benchmarks={benchmarks}
        />
      ) : (
        <ResultsContent 
          result={result}
          userTier={userTier}
          recommendations={recommendations}
          benchmarks={benchmarks}
        />
      )}
    </div>
  );
}
