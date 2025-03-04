
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ResultsLoader } from "@/components/quiz-results/ResultsLoader";
import { ResultsError } from "@/components/quiz-results/ResultsError";
import { ResultsContainer } from "@/components/quiz-results/ResultsContainer";

interface AIFeedback {
  strengths: string[];
  areas_for_improvement: string[];
  advice: string;
}

export default function QuizResults() {
  const { id } = useParams();
  const [results, setResults] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const { data: responseData, error: responseError } = await supabase
          .from('quiz_responses')
          .select(`
            *,
            quiz:quizzes(
              id,
              title,
              allow_retakes
            )
          `)
          .eq('id', id)
          .single();

        if (responseError) throw responseError;
        console.log("Quiz response data:", responseData);
        
        // Check if AI feedback exists and has content
        const feedback = responseData?.ai_feedback as AIFeedback | null;
        const hasFeedback = feedback && 
          ((feedback.strengths?.length > 0) || 
           (feedback.areas_for_improvement?.length > 0) || 
           feedback.advice);
           
        // Auto-generate feedback if it doesn't exist or is empty and quiz is completed
        if (responseData?.completed_at && !hasFeedback) {
          console.log("No substantive AI feedback available - generating now");
          generateFeedback();
        } else {
          console.log("AI Feedback:", responseData.ai_feedback);
        }
        
        setResults(responseData);
        setQuiz(responseData.quiz);
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
      setResults(prev => ({
        ...prev,
        ai_feedback: {
          strengths: ["Generating feedback..."],
          areas_for_improvement: ["Analyzing your answers..."],
          advice: "Please wait while we analyze your quiz performance."
        }
      }));
      
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
      
      // Update only the ai_feedback field in the results state
      setResults(prev => ({
        ...prev,
        ai_feedback: responseData.ai_feedback
      }));
      
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
        setResults(prev => ({
          ...prev,
          ai_feedback: null
        }));
      }
    } finally {
      setGeneratingFeedback(false);
    }
  };

  if (loading) return <ResultsLoader />;

  if (error || !results || !quiz) return <ResultsError error={error} />;

  return (
    <div className="container mx-auto py-8">
      <ResultsContainer 
        results={results}
        quiz={quiz}
        generateFeedback={generateFeedback}
        generatingFeedback={generatingFeedback}
      />
    </div>
  );
}
