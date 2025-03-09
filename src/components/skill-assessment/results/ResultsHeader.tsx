
import { ChevronLeft, Download, Share, ArrowUpRight, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface ResultsHeaderProps {
  title: string;
  createdAt: string;
  level?: string;
  userTier: string;
  exportPdfLoading: boolean;
  onExportPdf: () => void;
  onShareResults: () => void;
  onRetakeAssessment: () => void;
  assessmentId: string;
}

export const ResultsHeader = ({
  title,
  createdAt,
  level,
  userTier,
  exportPdfLoading,
  onExportPdf,
  onShareResults,
  onRetakeAssessment,
  assessmentId
}: ResultsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={() => navigate("/skill-assessments")}
        className="mb-4"
        aria-label="Back to assessments"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Assessments
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title} Results</h1>
          <p className="text-muted-foreground">
            Completed on {new Date(createdAt).toLocaleDateString()}
            {level && ` • ${level.charAt(0).toUpperCase() + level.slice(1)} level`}
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onExportPdf}
                    disabled={userTier === 'free' || exportPdfLoading}
                    className="relative w-full sm:w-auto"
                  >
                    {exportPdfLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export PDF
                    {userTier === 'free' && (
                      <Lock className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              {userTier === 'free' && (
                <TooltipContent>
                  <p>Upgrade to Pro or Premium to export results</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShareResults}
            className="w-full sm:w-auto"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button
            size="sm"
            onClick={onRetakeAssessment}
            className="w-full sm:w-auto"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Retake Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};
