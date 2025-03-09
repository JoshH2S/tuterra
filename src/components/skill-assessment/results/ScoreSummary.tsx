
import { Award } from "lucide-react";
import { AssessmentProgressTracker } from "@/components/skill-assessment/AssessmentProgress";

interface ScoreSummaryProps {
  score: number;
  timeSpent?: number;
  detailedResultsLength: number;
  level?: string;
  skillScores?: Record<string, { correct: number; total: number; score: number }>;
}

export const ScoreSummary = ({
  score,
  timeSpent,
  detailedResultsLength,
  level,
  skillScores
}: ScoreSummaryProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Format time display
  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Prepare sections for progress tracker
  const getSections = () => {
    if (!skillScores) return [];
    
    return Object.entries(skillScores).map(([skill, data]) => ({
      id: skill,
      label: skill,
      weight: data.total / (detailedResultsLength || 1),
      score: data.score
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative">
        <Award className="h-24 w-24 text-primary opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-muted-foreground">
        {score >= 80 ? (
          "Excellent! You've demonstrated strong skills in this assessment."
        ) : score >= 60 ? (
          "Good job! You've shown competency with room for improvement."
        ) : (
          "This area needs more practice. Consider reviewing the topics."
        )}
      </p>

      <div className="mt-6 space-y-4 w-full">
        <AssessmentProgressTracker 
          sections={getSections()}
          showScores={true}
        />
        
        <div className="pt-4 border-t flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Time spent</p>
            <p className="font-medium">{formatTime(timeSpent)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Questions</p>
            <p className="font-medium">{detailedResultsLength}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Level</p>
            <p className="font-medium capitalize">{level || "Intermediate"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
