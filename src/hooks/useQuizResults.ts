
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { QuizResponse, AIFeedback, QuestionResponse } from "@/types/quiz-results";

export function useQuizResults(id: string | undefined) {
  const [results, setResults] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a memoized function to parse complex structures
  const parseJsonField = useCallback((field: any) => {
    if (!field) return null;
    
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        console.error(`Error parsing JSON field:`, e);
        return null;
      }
    }
    
    return field;
  }, []);

  const fetchResults = useCallback(async (responseId: string) => {
    if (!responseId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Combined query - fetch all necessary data in one call with specific fields only
      const { data, error } = await supabase
        .from('quiz_responses')
        .select(`
          id,
          quiz_id,
          student_id,
          score,
          correct_answers,
          total_questions,
          completed_at,
          attempt_number,
          topic_performance,
          ai_feedback,
          quiz:quiz_id (
            id,
            title,
            allow_retakes
          ),
          question_responses:question_responses(
            question_id,
            student_answer,
            is_correct,
            topic,
            question:question_id (
              id,
              question,
              options,
              correct_answer,
              explanation,
              topic,
              difficulty,
              points
            )
          )
        `)
        .eq('id', responseId)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        throw new Error("Quiz response not found");
      }
      
      // Ensure topic_performance is properly typed
      const processedTopicPerformance = parseJsonField(data.topic_performance);
      
      // Ensure ai_feedback is properly typed
      const processedAIFeedback = parseJsonField(data.ai_feedback);
      
      // Process question responses to ensure they match the QuestionResponse type
      const processedQuestionResponses: QuestionResponse[] = data.question_responses.map((response: any) => ({
        question_id: response.question_id,
        student_answer: response.student_answer,
        is_correct: response.is_correct,
        topic: response.topic,
        question: response.question ? {
          ...response.question,
          // Ensure points is included (default to 1 if not present)
          points: response.question.points || 1
        } : null
      }));
      
      // Construct a complete result object with proper typing
      const completeResults: QuizResponse = {
        id: data.id,
        quiz_id: data.quiz_id,
        student_id: data.student_id,
        score: data.score,
        correct_answers: data.correct_answers,
        total_questions: data.total_questions,
        completed_at: data.completed_at,
        attempt_number: data.attempt_number,
        topic_performance: processedTopicPerformance,
        ai_feedback: processedAIFeedback,
        quiz: data.quiz,
        question_responses: processedQuestionResponses
      };
      
      setResults(completeResults);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching results:', error);
      setError(error.message || 'Failed to load quiz results');
      toast({
        title: "Error",
        description: "Failed to load quiz results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [parseJsonField]);

  useEffect(() => {
    if (id) {
      fetchResults(id);
    }
  }, [id, fetchResults]);

  return { results, loading, error, setResults };
}
