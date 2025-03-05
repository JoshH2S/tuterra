
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface QuizGenerationHeaderProps {
  onSaveTemplate?: () => void;
}

export const QuizGenerationHeader = ({ onSaveTemplate }: QuizGenerationHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Quiz Generation</h1>
          <p className="text-gray-600">Create AI-powered quizzes from your course materials</p>
        </div>
        <div className="flex gap-4">
          <Link to="/case-study-quiz">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Case Study Quiz
            </Button>
          </Link>
          <Link to="/quizzes">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Quizzes
            </Button>
          </Link>
          {onSaveTemplate && (
            <Button onClick={onSaveTemplate} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save as Template
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
