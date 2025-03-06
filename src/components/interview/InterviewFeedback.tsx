
import React from 'react';
import { useInterview } from '@/contexts/InterviewContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Download, RotateCcw } from 'lucide-react';

export const InterviewFeedback: React.FC = () => {
  const { state, resetInterview } = useInterview();
  
  if (!state.feedback) {
    return null;
  }
  
  const downloadTranscript = () => {
    if (!state.session || !state.questions || !state.responses) return;
    
    let transcriptText = `Interview for ${state.session.jobTitle} position in ${state.session.industry}\n\n`;
    
    state.questions.forEach((question, index) => {
      transcriptText += `Question ${index + 1}: ${question.question}\n`;
      transcriptText += `Your Answer: ${state.responses[question.id] || "No answer provided"}\n\n`;
    });
    
    transcriptText += `\nFEEDBACK:\n\n`;
    transcriptText += `Strengths:\n`;
    state.feedback.strengths.forEach(strength => {
      transcriptText += `- ${strength}\n`;
    });
    
    transcriptText += `\nAreas for Improvement:\n`;
    state.feedback.weaknesses.forEach(weakness => {
      transcriptText += `- ${weakness}\n`;
    });
    
    transcriptText += `\nTips:\n`;
    state.feedback.tips.forEach(tip => {
      transcriptText += `- ${tip}\n`;
    });
    
    transcriptText += `\nOverall Feedback:\n${state.feedback.overallFeedback || ""}\n`;
    
    // Create a blob and download link
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Interview Feedback</CardTitle>
        <CardDescription>
          Here's our assessment of your interview performance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Strengths */}
        <div>
          <h3 className="text-lg font-medium flex items-center mb-2">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2 pl-7">
            {state.feedback.strengths.map((strength, index) => (
              <li key={index} className="list-disc">{strength}</li>
            ))}
          </ul>
        </div>
        
        {/* Areas for improvement */}
        <div>
          <h3 className="text-lg font-medium flex items-center mb-2">
            <X className="h-5 w-5 text-amber-500 mr-2" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2 pl-7">
            {state.feedback.weaknesses.map((weakness, index) => (
              <li key={index} className="list-disc">{weakness}</li>
            ))}
          </ul>
        </div>
        
        {/* Specific advice */}
        <div>
          <h3 className="text-lg font-medium mb-2">Tips for Next Time</h3>
          <ul className="space-y-2 pl-7">
            {state.feedback.tips.map((tip, index) => (
              <li key={index} className="list-disc">{tip}</li>
            ))}
          </ul>
        </div>
        
        {/* Overall feedback */}
        {state.feedback.overallFeedback && (
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="text-lg font-medium mb-2">Overall Assessment</h3>
            <p>{state.feedback.overallFeedback}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button 
          variant="outline"
          onClick={downloadTranscript}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Transcript
        </Button>
        
        <Button 
          onClick={resetInterview}
          className="w-full sm:w-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Interview
        </Button>
      </CardFooter>
    </Card>
  );
};

// Add this export to fix the import in JobInterviewSimulator.tsx
export const InterviewFeedbackComponent = InterviewFeedback;
