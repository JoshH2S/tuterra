
import React, { useState, useEffect } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackExplanationProps {
  explanation?: string;
  isLoading: boolean;
  expanded: boolean;
  onToggle: () => void;
}

export function FeedbackExplanation({
  explanation,
  isLoading,
  expanded,
  onToggle
}: FeedbackExplanationProps) {
  const [showFullExplanation, setShowFullExplanation] = useState(expanded);
  
  // Reset state when expanded prop changes
  useEffect(() => {
    setShowFullExplanation(expanded);
  }, [expanded]);
  
  // Check if explanation is long enough to need expansion
  const isLongExplanation = explanation ? explanation.length > 120 : false;

  // Handle toggle internally or pass to external handler
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setShowFullExplanation(!showFullExplanation);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Info className="h-4 w-4 text-blue-500" /> 
          <p className="font-semibold text-blue-600 dark:text-blue-400">Generating explanation...</p>
        </div>
        <div className="h-2 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700 w-full"></div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="flex items-center gap-1 text-sm italic text-gray-500 dark:text-gray-400">
        <Info className="h-4 w-4" /> 
        <p>No explanation available for this question.</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "overflow-hidden transition-all duration-300 ease-in-out",
      !showFullExplanation && isLongExplanation && "max-h-24"
    )}>
      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold flex items-center gap-1 mb-1 text-blue-700 dark:text-blue-400">
          <Info className="h-4 w-4" /> Explanation:
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{explanation}</p>
        
        {isLongExplanation && (
          <button 
            onClick={handleToggle}
            className="mt-2 text-xs text-primary hover:underline focus:outline-none flex items-center gap-1"
            aria-label={showFullExplanation ? "Show less" : "Show more"}
          >
            {showFullExplanation ? "Show less" : "Show more"}
            {showFullExplanation ? 
              <ChevronUp className="h-3 w-3" /> : 
              <ChevronDown className="h-3 w-3" />
            }
          </button>
        )}
      </div>
    </div>
  );
}
