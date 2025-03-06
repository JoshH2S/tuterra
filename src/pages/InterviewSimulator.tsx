
import React from 'react';
import { useInterview, InterviewProvider } from '@/contexts/InterviewContext';
import { InterviewSetupForm } from '@/components/interview/InterviewSetupForm';
import { InterviewReadyScreen } from '@/components/interview/InterviewReadyScreen';
import { InterviewQuestionCard } from '@/components/interview/InterviewQuestionCard';
import { InterviewFeedback } from '@/components/interview/InterviewFeedback';
import { Loader2 } from 'lucide-react';

const InterviewSimulatorContent: React.FC = () => {
  const { state } = useInterview();
  
  // Handle loading state
  if (state.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Processing...</p>
      </div>
    );
  }
  
  // Handle error state
  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-destructive mb-2 text-xl">Error</div>
        <p className="text-muted-foreground">{state.error || 'Something went wrong'}</p>
      </div>
    );
  }
  
  // Show the appropriate screen based on the current status
  if (state.status === 'idle') {
    return <InterviewSetupForm />;
  }
  
  if (state.status === 'ready') {
    return <InterviewReadyScreen />;
  }
  
  if (state.status === 'in-progress') {
    return <InterviewQuestionCard />;
  }
  
  if (state.status === 'completed') {
    return <InterviewFeedback />;
  }
  
  return null;
};

const InterviewSimulator: React.FC = () => {
  return (
    <InterviewProvider>
      <div className="container py-8 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">Job Interview Simulator</h1>
        <InterviewSimulatorContent />
      </div>
    </InterviewProvider>
  );
};

export default InterviewSimulator;
