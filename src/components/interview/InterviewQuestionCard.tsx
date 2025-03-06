
import React, { useState } from 'react';
import { useInterview } from '@/contexts/InterviewContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';

export const InterviewQuestionCard: React.FC = () => {
  const { state, saveResponse, nextQuestion, previousQuestion, completeInterview } = useInterview();
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const currentResponse = currentQuestion ? state.responses[currentQuestion.id] || '' : '';
  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;
  
  // Initialize response with any existing answer
  React.useEffect(() => {
    if (currentQuestion) {
      setResponse(currentResponse);
    }
  }, [currentQuestion, currentResponse]);

  const handleSubmit = async () => {
    if (!currentQuestion || !response.trim()) return;
    
    setIsSubmitting(true);
    
    await saveResponse(currentQuestion.id, response);
    
    if (isLastQuestion) {
      await completeInterview();
    } else {
      nextQuestion();
      setResponse('');
    }
    
    setIsSubmitting(false);
  };

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No questions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {state.currentQuestionIndex + 1} of {state.questions.length}
          </span>
        </div>
        <div className="text-lg font-medium">{currentQuestion.question}</div>
      </CardHeader>
      
      <CardContent>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your answer here..."
          className="min-h-[150px] resize-none"
          disabled={isSubmitting}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={previousQuestion}
            disabled={state.currentQuestionIndex === 0 || isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!response.trim() || isSubmitting}
        >
          {isLastQuestion ? 'Complete Interview' : 'Next Question'}
          {isLastQuestion ? <Send className="h-4 w-4 ml-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </CardFooter>
    </Card>
  );
};
