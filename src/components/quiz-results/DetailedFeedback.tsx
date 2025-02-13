
import { Card, CardContent } from "@/components/ui/card";

interface AIFeedback {
  strengths?: string[];
  areas_for_improvement?: string[];
  advice?: string;
}

interface DetailedFeedbackProps {
  feedback: AIFeedback;
}

export function DetailedFeedback({ feedback }: DetailedFeedbackProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#091747]">Detailed Feedback</h2>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4 text-[#091747]">Areas of Strength</h3>
          {feedback.strengths?.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific strengths identified.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4 text-[#091747]">Areas for Improvement</h3>
          {feedback.areas_for_improvement?.length ? (
            <ul className="list-disc pl-5 space-y-2">
              {feedback.areas_for_improvement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific areas for improvement identified.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4 text-[#091747]">Advice Going Forward</h3>
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
