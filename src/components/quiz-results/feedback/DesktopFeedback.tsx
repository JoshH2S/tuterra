
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackHeader } from "./FeedbackHeader";
import { AIFeedback } from "../DetailedFeedback";

interface DesktopFeedbackProps {
  feedback: AIFeedback;
}

export function DesktopFeedback({ feedback }: DesktopFeedbackProps) {
  // Ensure arrays are properly initialized
  const strengths = Array.isArray(feedback.strengths) ? feedback.strengths : [];
  const areasForImprovement = Array.isArray(feedback.areas_for_improvement) ? feedback.areas_for_improvement : [];
  
  return (
    <div className="space-y-4">
      <FeedbackHeader />
      
      <Card className="border-t-4 border-t-green-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747]">Areas of Strength</h3>
          {strengths.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific strengths identified.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-amber-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747]">Areas for Improvement</h3>
          {areasForImprovement.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific areas for improvement identified.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-blue-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747]">Advice Going Forward</h3>
          {feedback.advice ? (
            <p>{feedback.advice}</p>
          ) : (
            <p className="text-muted-foreground">No specific advice available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
