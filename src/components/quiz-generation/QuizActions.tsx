
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

interface QuizActionsProps {
  onPublish: () => void;
  onDownload: () => void;
}

export const QuizActions = ({ onPublish, onDownload }: QuizActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        onClick={onPublish}
        variant="default"
        size="sm"
        className="w-full sm:w-auto order-first"
      >
        <Upload className="w-4 h-4 mr-2" />
        Publish Quiz
      </Button>
      <Button 
        onClick={onDownload}
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
      >
        <Download className="w-4 h-4 mr-2" />
        Download PDF
      </Button>
    </div>
  );
};
