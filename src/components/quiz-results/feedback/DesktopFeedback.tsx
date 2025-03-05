
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackHeader } from "./FeedbackHeader";
import { AIFeedback } from "../DetailedFeedback";
import { BookOpen, ThumbsUp, Lightbulb } from "lucide-react";

interface DesktopFeedbackProps {
  feedback: AIFeedback;
}

export function DesktopFeedback({ feedback }: DesktopFeedbackProps) {
  // Ensure arrays are properly initialized
  const strengths = Array.isArray(feedback.strengths) ? feedback.strengths : [];
  const areasForImprovement = Array.isArray(feedback.areas_for_improvement) ? feedback.areas_for_improvement : [];
  
  // Extract only topic names from strength statements with 90%+ performance
  const extractTopicNames = (strengthsList: string[]) => {
    const topicNames: string[] = [];
    
    strengthsList.forEach(strength => {
      // Check if the strength is about a specific topic and has a percentage
      if (strength.includes('Strong understanding of') && strength.includes('(')) {
        // Extract the topic name
        const topicMatch = strength.match(/Strong understanding of (.*?) \(/);
        if (topicMatch && topicMatch[1]) {
          const topic = topicMatch[1];
          
          // Extract the percentage
          const percentMatch = strength.match(/\((\d+)% correct\)/);
          if (percentMatch && percentMatch[1]) {
            const percentage = parseInt(percentMatch[1]);
            
            // Only include topics with 90% or above
            if (percentage >= 90) {
              topicNames.push(topic);
            }
          }
        }
      }
    });
    
    return topicNames;
  };
  
  const topicStrengths = extractTopicNames(strengths);
  
  return (
    <div className="space-y-4">
      <FeedbackHeader />
      
      <Card className="border-t-4 border-t-green-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747] flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-600" />
            <span>Areas of Strength</span>
          </h3>
          {topicStrengths.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {topicStrengths.map((topic, index) => (
                <li key={index} className="text-slate-700">{topic}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No topics with strong performance (90%+) identified.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-amber-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <span>Areas for Improvement</span>
          </h3>
          {areasForImprovement.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {areasForImprovement.map((area, index) => (
                <li key={index} className="text-slate-700">{area}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No specific areas for improvement identified.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-blue-500">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-3 text-[#091747] flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <span>Advice Going Forward</span>
          </h3>
          {feedback.advice ? (
            <p className="text-slate-700">{feedback.advice}</p>
          ) : (
            <p className="text-muted-foreground">No specific advice available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
