
import { Info } from "lucide-react";

interface QuestionExplanationProps {
  explanation: string;
}

export const QuestionExplanation = ({ explanation }: QuestionExplanationProps) => {
  if (!explanation) return null;
  
  return (
    <div className="flex items-start gap-1 mt-1 text-sm text-muted-foreground">
      <Info className="h-4 w-4 min-w-4 mt-0.5 text-muted-foreground/70" />
      <p>Explanation: {explanation}</p>
    </div>
  );
};
