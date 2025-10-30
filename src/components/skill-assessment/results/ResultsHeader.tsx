
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, Share2, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsHeaderProps {
  title: string;
  createdAt: string;
  level: string;
  userTier: string;
  exportPdfLoading: boolean;
  onExportPdf: () => void;
  onShareResults: () => void;
  onRetakeAssessment: () => void;
  assessmentId: string;
}

export function ResultsHeader({
  title,
  createdAt,
  level,
  userTier,
  exportPdfLoading,
  onExportPdf,
  onShareResults,
  onRetakeAssessment,
  assessmentId
}: ResultsHeaderProps) {
  const isMobile = useIsMobile();
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-white/80">
            <span>Completed on {formattedDate}</span>
            <span className="hidden sm:inline">•</span>
            <span className="capitalize">{level} Level</span>
            {userTier !== 'free' && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="capitalize">{userTier} Plan</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex-1 sm:flex-none gap-1"
            onClick={onExportPdf}
            disabled={exportPdfLoading}
          >
            {exportPdfLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex-1 sm:flex-none gap-1"
            onClick={onShareResults}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          
          <Button
            variant="default"
            size={isMobile ? "sm" : "default"}
            className="flex-1 sm:flex-none gap-1"
            onClick={onRetakeAssessment}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Retake</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
