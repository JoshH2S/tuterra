
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  // Handle case when feedback is null or undefined
  if (!feedback) {
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

  return (
    <div className="space-y-4">
      <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[#091747]`}>Detailed Feedback</h2>
      
      <Card>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'}`}>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-3 text-[#091747]`}>Areas of Strength</h3>
          {feedback.strengths?.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {feedback.strengths.map((strength, index) => (
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
          {feedback.areas_for_improvement?.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {feedback.areas_for_improvement.map((area, index) => (
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
          {feedback.advice ? (
            <p className={`${isMobile ? 'text-sm' : ''}`}>{feedback.advice}</p>
          ) : (
            <p className="text-muted-foreground">No specific advice available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
