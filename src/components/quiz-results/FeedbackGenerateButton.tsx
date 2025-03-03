
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FeedbackGenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export function FeedbackGenerateButton({ 
  onGenerate, 
  isGenerating 
}: FeedbackGenerateButtonProps) {
  return (
    <div className="flex justify-center">
      <Button 
        onClick={onGenerate} 
        disabled={isGenerating}
        className="mt-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Feedback...
          </>
        ) : (
          "Generate AI Feedback"
        )}
      </Button>
    </div>
  );
}
