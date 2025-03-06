
import { Badge } from "@/components/ui/badge";
import { QuestionCategory, QuestionDifficulty } from "@/types/interview";

type BadgeType = "category" | "difficulty";

interface QuestionBadgeProps {
  type: BadgeType;
  value: QuestionCategory | QuestionDifficulty | undefined;
}

const getCategoryColor = (category: QuestionCategory): string => {
  switch (category) {
    case "Technical":
      return "bg-blue-500 hover:bg-blue-600";
    case "Behavioral":
      return "bg-green-500 hover:bg-green-600";
    case "Situational":
      return "bg-purple-500 hover:bg-purple-600";
    case "Experience":
      return "bg-amber-500 hover:bg-amber-600";
    case "Core":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "";
  }
};

const getDifficultyColor = (difficulty: QuestionDifficulty): string => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500 hover:bg-green-600";
    case "Medium":
      return "bg-amber-500 hover:bg-amber-600";
    case "Hard":
      return "bg-red-500 hover:bg-red-600";
    default:
      return "";
  }
};

export const QuestionBadge = ({ type, value }: QuestionBadgeProps) => {
  if (!value) return null;
  
  let customClass = "";
  
  if (type === "category" && typeof value === "string") {
    customClass = getCategoryColor(value as QuestionCategory);
  } else if (type === "difficulty" && typeof value === "string") {
    customClass = getDifficultyColor(value as QuestionDifficulty);
  }
  
  return (
    <Badge 
      variant="default" 
      className={`text-xs font-medium ${customClass}`}
    >
      {value}
    </Badge>
  );
};
