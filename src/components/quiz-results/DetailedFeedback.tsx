
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

interface AIFeedback {
  strengths?: string[];
  areas_for_improvement?: string[];
  advice?: string;
}

interface DetailedFeedbackProps {
  feedback: AIFeedback | null | undefined;
}

export function DetailedFeedback({ feedback }: DetailedFeedbackProps) {
  const isMobile = useIsMobile();
  const [parsedFeedback, setParsedFeedback] = useState<AIFeedback | null>(null);
  
  useEffect(() => {
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

  console.log("Feedback data:", feedback);
  console.log("Parsed feedback:", parsedFeedback);
  
  // Handle case when feedback is null or undefined
  if (!parsedFeedback) {
    return (
      <div className="space-y-4">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#091747]`}>Detailed Feedback</h2>
        <Card>
          <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'}`}>
            <p className="text-muted-foreground">Feedback not available for this quiz yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure arrays are properly initialized
  const strengths = Array.isArray(parsedFeedback.strengths) ? parsedFeedback.strengths : [];
  const areasForImprovement = Array.isArray(parsedFeedback.areas_for_improvement) ? parsedFeedback.areas_for_improvement : [];

  return (
    <div className="space-y-4">
      <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#091747]`}>Detailed Feedback</h2>
      
      <Card>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'}`}>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-3 text-[#091747]`}>Areas of Strength</h3>
          {strengths.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className={`${isMobile ? 'text-sm' : ''}`}>{strength}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific strengths identified.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'}`}>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-3 text-[#091747]`}>Areas for Improvement</h3>
          {areasForImprovement.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {areasForImprovement.map((area, index) => (
                <li key={index} className={`${isMobile ? 'text-sm' : ''}`}>{area}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific areas for improvement identified.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'}`}>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-3 text-[#091747]`}>Advice Going Forward</h3>
          {parsedFeedback.advice ? (
            <p className={`${isMobile ? 'text-sm' : ''}`}>{parsedFeedback.advice}</p>
          ) : (
            <p className="text-muted-foreground">No specific advice available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
