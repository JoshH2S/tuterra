
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { MobileFeedback } from "./feedback/MobileFeedback";
import { DesktopFeedback } from "./feedback/DesktopFeedback";
import { LoadingFeedback } from "./feedback/LoadingFeedback";
import { EmptyFeedback } from "./feedback/EmptyFeedback";

export interface AIFeedback {
  strengths?: string[];
  areas_for_improvement?: string[];
  advice?: string;
}

interface DetailedFeedbackProps {
  feedback: AIFeedback | null | undefined;
  isGenerating?: boolean;
}

export function DetailedFeedback({ feedback, isGenerating = false }: DetailedFeedbackProps) {
  const isMobile = useIsMobile();
  const [parsedFeedback, setParsedFeedback] = useState<AIFeedback | null>(null);
  
  useEffect(() => {
    console.log("Feedback data:", feedback);
    
    // Handle different feedback formats and ensure we parse correctly
    if (feedback) {
      try {
        // If feedback is a string, attempt to parse it
        if (typeof feedback === 'string') {
          setParsedFeedback(JSON.parse(feedback));
        } 
        // If it's an object, use it directly
        else {
          setParsedFeedback(feedback);
        }
      } catch (e) {
        console.error("Error parsing feedback:", e);
        setParsedFeedback(null);
      }
    } else {
      setParsedFeedback(null);
    }
  }, [feedback]);

  // Check if the feedback is in the "generating" state from placeholder text
  const isGeneratingFromContent = parsedFeedback?.strengths?.[0] === "Generating feedback...";
  const effectivelyGenerating = isGenerating || isGeneratingFromContent;

  // If feedback is being generated, show loading state
  if (effectivelyGenerating) {
    return <LoadingFeedback />;
  }
  
  // Check if we have meaningful feedback (not just empty arrays/strings)
  const hasStrengths = parsedFeedback?.strengths && parsedFeedback.strengths.length > 0 && 
    parsedFeedback.strengths[0] !== "";
  const hasAreasForImprovement = parsedFeedback?.areas_for_improvement && 
    parsedFeedback.areas_for_improvement.length > 0 && 
    parsedFeedback.areas_for_improvement[0] !== "";
  const hasAdvice = parsedFeedback?.advice && parsedFeedback.advice !== "";
  
  const hasMeaningfulFeedback = hasStrengths || hasAreasForImprovement || hasAdvice;
  
  // Handle case when feedback is null or undefined or empty
  if (!parsedFeedback || !hasMeaningfulFeedback) {
    return <EmptyFeedback />;
  }

  // Render appropriate feedback component based on device
  return isMobile 
    ? <MobileFeedback feedback={parsedFeedback} /> 
    : <DesktopFeedback feedback={parsedFeedback} />;
}
