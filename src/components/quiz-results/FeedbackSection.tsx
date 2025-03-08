
import React from "react";
import { DetailedFeedback } from "./DetailedFeedback";
import { FeedbackGenerateButton } from "./FeedbackGenerateButton";
import { AIFeedback } from "@/types/quiz-results";

interface FeedbackSectionProps {
  feedback: AIFeedback | null | undefined;
  generateFeedback: () => void;
  generatingFeedback: boolean;
}

export function FeedbackSection({ 
  feedback, 
  generateFeedback, 
  generatingFeedback 
}: FeedbackSectionProps) {
  // Check if we have meaningful feedback
  const hasStrengths = feedback?.strengths?.length > 0 && 
    feedback.strengths[0] !== "";
  const hasAreasForImprovement = feedback?.areas_for_improvement?.length > 0 && 
    feedback.areas_for_improvement[0] !== "";
  const hasAdvice = feedback?.advice && 
    feedback.advice !== "";
  
  const hasMeaningfulFeedback = hasStrengths || hasAreasForImprovement || hasAdvice;
  const isGeneratingMessage = feedback?.strengths?.[0] === "Generating feedback...";
  const shouldShowGenerateButton = !hasMeaningfulFeedback || isGeneratingMessage;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <DetailedFeedback 
        feedback={feedback} 
        isGenerating={generatingFeedback}
      />
      
      {shouldShowGenerateButton && !generatingFeedback && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <FeedbackGenerateButton 
            onGenerate={generateFeedback}
            isGenerating={generatingFeedback}
          />
        </div>
      )}
    </div>
  );
}
