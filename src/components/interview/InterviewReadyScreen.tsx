
import React from 'react';
import { useInterview } from '@/contexts/InterviewContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JOB_TITLE_OPTIONS, INDUSTRY_OPTIONS } from '@/constants/interviewOptions';

export const InterviewReadyScreen: React.FC = () => {
  const { state, startInterview } = useInterview();
  
  if (!state.session) {
    return null;
  }
  
  // Get readable job title and industry
  const jobTitle = JOB_TITLE_OPTIONS.find(opt => opt.value === state.session.jobTitle)?.label || state.session.jobTitle;
  const industry = INDUSTRY_OPTIONS.find(opt => opt.value === state.session.industry)?.label || state.session.industry;

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Interview Ready</CardTitle>
        <CardDescription>
          Your interview questions have been generated. Get ready to answer questions as if you were in a real interview.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-sm">Position:</h3>
          <p>{jobTitle}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-sm">Industry:</h3>
          <p>{industry}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-sm">Number of Questions:</h3>
          <p>{state.questions.length}</p>
        </div>
        
        <div className="rounded-lg bg-muted p-4">
          <h3 className="font-medium mb-2">Tips for Success:</h3>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Take your time to think before answering</li>
            <li>Use concrete examples from your experience</li>
            <li>Be concise but thorough in your responses</li>
            <li>Stay focused on the question being asked</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={startInterview} 
          className="w-full"
        >
          Begin Interview
        </Button>
      </CardFooter>
    </Card>
  );
};
