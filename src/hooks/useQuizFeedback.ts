
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { QuizResponse, AIFeedback } from "@/types/quiz-results";

export function useQuizFeedback(setResults: React.Dispatch<React.SetStateAction<QuizResponse | null>>) {
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  const generateFeedback = async (id: string) => {
    if (!id) return;
    
    try {
      setGeneratingFeedback(true);
      
      // First update results with a placeholder for better UX
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
      setResults(prev => {
        if (!prev) return null;
        if (prev.ai_feedback?.strengths?.[0] === "Generating feedback...") {
          return {
            ...prev,
            ai_feedback: null
          };
        }
        return prev;
      });
    } finally {
      setGeneratingFeedback(false);
    }
  };

  return { generatingFeedback, generateFeedback };
}
