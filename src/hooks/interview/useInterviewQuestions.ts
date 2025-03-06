
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
    questions.length > 0 && currentQuestionIndex < questions.length 
      ? questions[currentQuestionIndex] 
      : undefined,
    [questions, currentQuestionIndex]
  );

  const progress = useMemo(() => ({
    current: questions.length > 0 ? currentQuestionIndex + 1 : 0,
    total: questions.length || 0,
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
      console.log("Starting question generation for:", config);
      const result = await interviewQuestionService.generateInterviewQuestions(config);
      
      if (!activeRequests.current.has(requestId)) {
        console.log("Request was cancelled");
        return null; // Request was cancelled
      }

      sessionIdRef.current = uuidv4();
      
      // Ensure we have valid questions before updating state
      if (result && result.questions && result.questions.length > 0) {
        console.log(`Successfully generated ${result.questions.length} questions`);
        
        // Validate all questions have the required properties
        const validQuestions = result.questions.filter(q => 
          q && q.id && q.text && typeof q.text === 'string' && q.text.trim() !== ''
        );
        
        if (validQuestions.length < result.questions.length) {
          console.warn(`Filtered out ${result.questions.length - validQuestions.length} invalid questions`);
        }
        
        if (validQuestions.length === 0) {
          throw new Error("No valid questions were returned");
        }
        
        setQuestions(validQuestions);
        setMetadata(result.metadata);
        setCurrentQuestionIndex(0);
        return result;
      } else {
        console.error("No questions returned or empty array", result);
        throw new Error("No questions were returned");
      }
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
    if (questions.length === 0) return false;
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
