
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QuizActionsProps {
  onPublish: () => void;
  onDownload: () => void;
}

export const QuizActions = ({ onPublish, onDownload }: QuizActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onPublish}
        variant="default"
        size="sm"
      >
        Publish Quiz
      </Button>
      <Button 
        onClick={onDownload}
        variant="outline"
        size="sm"
      >
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
};
