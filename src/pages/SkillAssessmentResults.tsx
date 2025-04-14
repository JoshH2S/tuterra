
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
    skillBenchmarks,
    exportPdfLoading,
    handleExportPdf,
    handleShareResults,
    handleRetakeAssessment
  } = useAssessmentResults(id);

  if (loading) {
    return (
      <div className="container px-4 py-8 flex justify-center items-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result || !assessment) {
    return (
      <div className="container px-4 py-6 sm:py-8 w-full">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Results not found</h2>
            <p className="text-sm mb-4">The assessment results you're looking for don't exist or you don't have access to them.</p>
            <Button onClick={() => navigate("/skill-assessments")}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full">
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
          skillBenchmarks={skillBenchmarks}
        />
      ) : (
        <ResultsContent 
          result={result}
          userTier={userTier}
          recommendations={recommendations}
          benchmarks={benchmarks}
          skillBenchmarks={skillBenchmarks}
        />
      )}
    </div>
  );
}
