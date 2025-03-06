
import React from 'react';
import { useInterview } from '@/contexts/InterviewContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

export const InterviewFeedback: React.FC = () => {
  const { state, resetInterview } = useInterview();
  const feedback = state.feedback;

  if (!feedback) return null;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl text-center">
          Interview Feedback
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall feedback section */}
        {feedback.overallFeedback && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Overall Assessment</h3>
            <p className="text-muted-foreground">{feedback.overallFeedback}</p>
          </div>
        )}
        
        <Separator />
        
        {/* Strengths section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Strengths</span>
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Strength
                </Badge>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator />
        
        {/* Weaknesses section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span>Areas for Improvement</span>
          </h3>
          <ul className="space-y-2">
            {feedback.weaknesses.map((weakness, index) => (
              <li key={index} className="flex gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Improve
                </Badge>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator />
        
        {/* Tips section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span>Tips for Next Time</span>
          </h3>
          <ul className="space-y-2">
            {feedback.tips.map((tip, index) => (
              <li key={index} className="flex gap-2">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Tip
                </Badge>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button onClick={resetInterview} className="w-full max-w-xs">
          Start a New Interview
        </Button>
      </CardFooter>
    </Card>
  );
};

// Add named export for proper import
export { InterviewFeedback as InterviewFeedbackComponent };
