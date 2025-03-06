
import { useState, useCallback, useMemo } from "react";
import { Question, InterviewMetadata } from "@/types/interview";
import { interviewQuestionService } from "@/services/interviewQuestionService";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "@/lib/uuid";

interface UseInterviewQuestionsProps {
  industry: string;
  role: string;
  jobDescription: string;
  numberOfQuestions?: number;
  onStartGenerating: () => void;
  onFinishGenerating: () => void;
}

export const useInterviewQuestions = ({
  industry,
  role,
  jobDescription,
  numberOfQuestions = 5,
  onStartGenerating,
  onFinishGenerating
}: UseInterviewQuestionsProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [metadata, setMetadata] = useState<InterviewMetadata | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { toast } = useToast();
  
  // Memoized derived values
  const currentQuestion = useMemo(() => 
    questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );

  const progress = useMemo(() => ({
    current: currentQuestionIndex + 1,
    total: questions.length,
    percentage: questions.length 
      ? ((currentQuestionIndex + 1) / questions.length) * 100 
      : 0
  }), [questions.length, currentQuestionIndex]);

  const generateQuestions = useCallback(async (sessionIdRef: React.MutableRefObject<string>, activeRequests: React.MutableRefObject<Set<string>>) => {
    const config = {
      industry,
      role,
      jobDescription,
      numberOfQuestions
    };

    const requestId = uuidv4();
    activeRequests.current.add(requestId);
    onStartGenerating();

    try {
      const result = await interviewQuestionService.generateInterviewQuestions(config);
      
      if (!activeRequests.current.has(requestId)) return null; // Request was cancelled

      sessionIdRef.current = uuidv4();
      
      setQuestions(result.questions);
      setMetadata(result.metadata);
      setCurrentQuestionIndex(0);
      
      return result;
    } catch (error) {
      console.error("Interview questions generation error:", error);
      toast({
        title: "Setup Error",
        description: "Failed to generate interview questions. Using fallback questions.",
        variant: "destructive",
      });
      return null;
    } finally {
      if (activeRequests.current.has(requestId)) {
        activeRequests.current.delete(requestId);
        onFinishGenerating();
      }
    }
  }, [industry, role, jobDescription, numberOfQuestions, onStartGenerating, onFinishGenerating, toast]);

  const advanceToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentQuestionIndex, questions.length]);

  return {
    questions,
    metadata,
    currentQuestion,
    currentQuestionIndex,
    progress,
    generateQuestions,
    advanceToNextQuestion,
    setCurrentQuestionIndex
  };
};
