
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ResultsLoader } from "@/components/quiz-results/ResultsLoader";
import { ResultsError } from "@/components/quiz-results/ResultsError";
import { ResultsContainer } from "@/components/quiz-results/ResultsContainer";
import { QuizResponse, AIFeedback } from "@/types/quiz-results";

export default function QuizResults() {
  const { id } = useParams();
  const [results, setResults] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

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
        
        // Check if AI feedback exists and has content - with proper type checking/casting
        let feedback: AIFeedback | null = null;
        
        if (responseData?.ai_feedback) {
          try {
            // If it's a string (from JSON.stringify), parse it
            if (typeof responseData.ai_feedback === 'string') {
              feedback = JSON.parse(responseData.ai_feedback) as AIFeedback;
            } 
            // If it's already an object
            else {
              feedback = responseData.ai_feedback as unknown as AIFeedback;
            }
          } catch (e) {
            console.error("Error parsing AI feedback:", e);
            feedback = null;
          }
        }
        
        // Check for valid topic-specific feedback (more specific criteria)
        const hasValidFeedback = feedback && 
          Array.isArray(feedback.strengths) && 
          feedback.strengths.length > 0 &&
          feedback.strengths[0] !== "Generating feedback..." &&
          Array.isArray(feedback.areas_for_improvement);
           
        // Auto-generate feedback if it doesn't exist or lacks topic-specific content
        if (responseData?.completed_at && !hasValidFeedback) {
          console.log("No valid AI feedback available - will generate if needed");
        }
        
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

  const generateFeedback = async () => {
    if (!id) return;
    
    try {
      setGeneratingFeedback(true);
      
      // First update results with a placeholder for better UX
      if (results) {
        setResults(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ai_feedback: {
              strengths: ["Generating feedback..."],
              areas_for_improvement: ["Analyzing your answers..."],
              advice: "Please wait while we analyze your quiz performance."
            }
          };
        });
      }
      
      // Toast to inform user
      toast({
        title: "Generating Feedback",
        description: "Analyzing your quiz performance...",
      });
      
      const { data, error } = await supabase.functions.invoke('generate-quiz-feedback', {
        body: { quizResponseId: id }
      });
      
      if (error) throw error;
      
      // Refetch the results to get the updated feedback
      const { data: responseData, error: responseError } = await supabase
        .from('quiz_responses')
        .select(`*`)
        .eq('id', id)
        .single();
        
      if (responseError) throw responseError;
      
      console.log("Updated feedback from database:", responseData.ai_feedback);
      
      // Update the results state with fresh data
      setResults(prev => {
        if (!prev) return null;
        
        // Make sure the feedback is properly typed
        let typedFeedback: AIFeedback | null = null;
        let processedTopicPerformance: Record<string, { correct: number; total: number }> | null = null;
        
        if (responseData.ai_feedback) {
          // Handle different formats
          if (typeof responseData.ai_feedback === 'string') {
            try {
              typedFeedback = JSON.parse(responseData.ai_feedback);
            } catch (e) {
              console.error("Error parsing AI feedback:", e);
            }
          } else {
            typedFeedback = responseData.ai_feedback as unknown as AIFeedback;
          }
        }
        
        // Process topic_performance
        if (responseData.topic_performance) {
          if (typeof responseData.topic_performance === 'string') {
            try {
              processedTopicPerformance = JSON.parse(responseData.topic_performance);
            } catch (e) {
              console.error("Error parsing topic_performance:", e);
            }
          } else {
            processedTopicPerformance = responseData.topic_performance as Record<string, { correct: number; total: number }>;
          }
        }
        
        return {
          ...prev,
          ai_feedback: typedFeedback,
          topic_performance: processedTopicPerformance
        };
      });
      
      toast({
        title: "Success",
        description: "Feedback generated successfully",
      });
    } catch (error: any) {
      console.error('Error generating feedback:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate feedback",
        variant: "destructive",
      });
      
      // Reset the placeholder if there was an error
      if (results?.ai_feedback?.strengths?.[0] === "Generating feedback...") {
        setResults(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ai_feedback: null
          };
        });
      }
    } finally {
      setGeneratingFeedback(false);
    }
  };

  if (loading) return <ResultsLoader />;
  if (error || !results || !results.quiz) return <ResultsError error={error} />;

  return (
    <div className="container mx-auto py-8">
      <ResultsContainer 
        results={results}
        quiz={results.quiz}
        generateFeedback={generateFeedback}
        generatingFeedback={generatingFeedback}
      />
    </div>
  );
}
