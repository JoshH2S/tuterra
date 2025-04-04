
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface QuizGenerationHeaderProps {
  onSaveTemplate?: () => void;
}

export const QuizGenerationHeader = ({ onSaveTemplate }: QuizGenerationHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">AI Quiz Generation</h1>
          <p className="text-gray-600 dark:text-gray-400">Create AI-powered quizzes from your course materials</p>
        </div>
        {onSaveTemplate && (
          <Button onClick={onSaveTemplate} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save as Template
          </Button>
        )}
      </div>
    </div>
  );
};
