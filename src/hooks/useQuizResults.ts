
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { QuizResponse, AIFeedback } from "@/types/quiz-results";

export function useQuizResults(id: string | undefined) {
  const [results, setResults] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        setError("No quiz ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // First check if the quiz response exists
        const { data: responseData, error: responseError } = await supabase
          .from('quiz_responses')
          .select(`
            id,
            quiz_id,
            student_id,
            score,
            correct_answers,
            total_questions,
            completed_at,
            topic_performance,
            ai_feedback,
            attempt_number
          `)
          .eq('id', id)
          .single();

        if (responseError) {
          console.error("Error fetching quiz response:", responseError);
          throw new Error("Failed to load quiz response");
        }
        
        if (!responseData) {
          throw new Error("Quiz response not found");
        }
        
        // Now fetch the quiz separately
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select(`
            id,
            title,
            allow_retakes
          `)
          .eq('id', responseData.quiz_id)
          .single();
          
        if (quizError) {
          console.error("Error fetching quiz:", quizError);
          throw new Error("Failed to load quiz details");
        }
        
        // Now fetch question responses separately
        const { data: questionResponsesData, error: questionResponsesError } = await supabase
          .from('question_responses')
          .select(`
            question_id,
            student_answer,
            is_correct,
            topic
          `)
          .eq('quiz_response_id', id);
          
        if (questionResponsesError) {
          console.error("Error fetching question responses:", questionResponsesError);
          // Don't throw here - we can still show basic results without question details
        }
        
        // Get question details separately
        const questionResponsesWithQuestions = [...(questionResponsesData || [])].map(qr => ({
          ...qr,
          question: null
        }));
        
        if (questionResponsesData && questionResponsesData.length > 0) {
          const questionIds = questionResponsesData.map(qr => qr.question_id);
          
          const { data: questionsData, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .in('id', questionIds);
            
          if (questionsError) {
            console.error("Error fetching questions:", questionsError);
          } else if (questionsData) {
            // Merge question responses with question details
            questionResponsesWithQuestions.forEach((qr, index) => {
              const question = questionsData.find(q => q.id === qr.question_id);
              questionResponsesWithQuestions[index] = {
                ...qr,
                question: question || null
              };
            });
          }
        }
        
        // Process topic_performance to ensure it's the correct type
        let processedTopicPerformance: Record<string, { correct: number; total: number }> | null = null;
        
        if (responseData.topic_performance) {
          // Handle string format (sometimes stored as JSON string)
          if (typeof responseData.topic_performance === 'string') {
            try {
              processedTopicPerformance = JSON.parse(responseData.topic_performance);
            } catch (e) {
              console.error("Error parsing topic_performance:", e);
              processedTopicPerformance = null;
            }
          } 
          // Handle object format
          else if (typeof responseData.topic_performance === 'object') {
            processedTopicPerformance = responseData.topic_performance as Record<string, { correct: number; total: number }>;
          }
        }
        
        // Process ai_feedback to ensure it's the correct type
        let processedAIFeedback: AIFeedback | null = null;
        
        if (responseData.ai_feedback) {
          // If it's a string (from JSON.stringify), parse it
          if (typeof responseData.ai_feedback === 'string') {
            try {
              processedAIFeedback = JSON.parse(responseData.ai_feedback) as AIFeedback;
            } catch (e) {
              console.error("Error parsing AI feedback:", e);
              processedAIFeedback = null;
            }
          } 
          // If it's already an object
          else {
            processedAIFeedback = responseData.ai_feedback as unknown as AIFeedback;
          }
        }
        
        // Construct a complete result object with proper typing
        const completeResults: QuizResponse = {
          ...responseData,
          quiz: quizData,
          question_responses: questionResponsesWithQuestions,
          // Ensure topic_performance is properly typed
          topic_performance: processedTopicPerformance,
          // Ensure ai_feedback is properly typed
          ai_feedback: processedAIFeedback
        };
        
        console.log("Quiz response data:", completeResults);
        
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
    };

    if (id) {
      fetchResults();
    }
  }, [id]);

  return { results, loading, error, setResults };
}
