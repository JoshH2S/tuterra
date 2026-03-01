
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface QuizGenerationHeaderProps {
  onSaveTemplate?: () => void;
}

export const QuizGenerationHeader = ({ onSaveTemplate }: QuizGenerationHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <h1 className="text-lg font-semibold tracking-tight text-[#091747]">AI Quiz Generation</h1>
      {onSaveTemplate && (
        <Button onClick={onSaveTemplate} variant="ghost" size="sm" className="text-stone-400 hover:text-stone-600 hover:bg-transparent text-xs gap-1.5">
          <Save className="w-3.5 h-3.5" />
          Save Template
        </Button>
      )}
    </div>
  );
};
