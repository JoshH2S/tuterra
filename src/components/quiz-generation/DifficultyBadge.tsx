
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_COLORS, QuestionDifficulty } from "@/types/quiz";
import { Award } from "lucide-react";

interface DifficultyBadgeProps {
  difficulty: QuestionDifficulty;
}

export const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  return (
    <Badge 
      variant="secondary" 
      className={`${DIFFICULTY_COLORS[difficulty]} capitalize flex items-center gap-1`}
    >
      <Award className="h-3 w-3" />
      {difficulty.replace('_', ' ')}
    </Badge>
  );
};
