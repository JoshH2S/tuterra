
import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, HelpCircle, AlertCircle } from "lucide-react";

interface ProgressSectionProps {
  id: string;
  label: string;
  weight: number;
  score?: number;
}

interface AssessmentProgressProps {
  sections: ProgressSectionProps[];
  currentQuestion?: number;
  totalQuestions?: number;
  timeRemaining?: number;
  totalTime?: number;
  showScores?: boolean;
}

export const AssessmentProgressTracker = ({
  sections,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  totalTime,
  showScores = false,
}: AssessmentProgressProps) => {
  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (showScores) {
      return sections.reduce((acc, section) => {
        return acc + (section.score || 0) * section.weight;
      }, 0);
    }
    
    if (currentQuestion !== undefined && totalQuestions) {
      return Math.round((currentQuestion / totalQuestions) * 100);
    }
    
    return 0;
  }, [sections, currentQuestion, totalQuestions, showScores]);

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Time progress percentage
  const timeProgress = useMemo(() => {
    if (timeRemaining === undefined || totalTime === undefined) return 100;
    return Math.max(0, Math.round((timeRemaining / totalTime) * 100));
  }, [timeRemaining, totalTime]);

  return (
    <div className="space-y-4 w-full">
      {/* Overall progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {showScores ? "Overall Score" : "Progress"}
          </span>
          <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" indicatorClassName={
          showScores
            ? overallProgress > 80
              ? "bg-green-500"
              : overallProgress > 50
              ? "bg-amber-500"
              : "bg-red-500"
            : undefined
        } />
      </div>

      {/* Section breakdown */}
      {showScores && (
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-medium mb-2">Section Breakdown</h4>
          {sections.map((section) => (
            <div key={section.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs">{section.label}</span>
                <span className="text-xs font-medium">{section.score || 0}%</span>
              </div>
              <Progress 
                value={section.score || 0} 
                className="h-1.5" 
                indicatorClassName={
                  section.score && section.score > 80
                    ? "bg-green-500"
                    : section.score && section.score > 50
                    ? "bg-amber-500"
                    : "bg-red-500"
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Question progress */}
      {!showScores && currentQuestion !== undefined && totalQuestions && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{currentQuestion} of {totalQuestions} questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            {timeRemaining !== undefined && (
              <>
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeRemaining)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Time remaining */}
      {!showScores && timeRemaining !== undefined && totalTime !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Time Remaining</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <Progress 
            value={timeProgress} 
            className="h-1.5" 
            indicatorClassName={
              timeProgress > 66
                ? "bg-green-500"
                : timeProgress > 33
                ? "bg-amber-500"
                : "bg-red-500"
            }
          />
        </div>
      )}

      {/* Legend for scores */}
      {showScores && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Excellent (80%+)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Good (50-80%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Needs Work (≤50%)</span>
          </div>
        </div>
      )}
    </div>
  );
};
