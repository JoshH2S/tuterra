
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface FeedbackGenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
  fullWidth?: boolean;
}

export function FeedbackGenerateButton({ 
  onGenerate, 
  isGenerating,
  fullWidth = false
}: FeedbackGenerateButtonProps) {
  return (
    <Button
      onClick={onGenerate}
      disabled={isGenerating}
      className={fullWidth ? "w-full" : ""}
      size={fullWidth ? "lg" : "default"}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Feedback...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate AI Feedback
        </>
      )}
    </Button>
  );
}
