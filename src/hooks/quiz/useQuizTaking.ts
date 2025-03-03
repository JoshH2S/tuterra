
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface QuizQuestion {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  topic: string;
  points: number;
  difficulty: string;
  explanation?: string;
}

export const useQuizTaking = (
  quizId: string,
  questions: QuizQuestion[],
  onSubmitSuccess?: () => void
) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  // Reset state when quiz changes
  useEffect(() => {
    if (quizId && questions.length > 0) {
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setIsSubmitting(false);
      setShowFeedback(false);
    }
  }, [quizId, questions]);

  const handleAnswerSelect = useCallback((questionIndex: number, answer: string) => {
    if (showFeedback) return; // Don't allow changing answer when feedback is shown
    
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowFeedback(true); // Show feedback immediately after selecting an answer
  }, [showFeedback]);

  const handleNextQuestion = useCallback(() => {
    if (questions.length > 0 && currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false); // Reset feedback for the next question
    }
  }, [currentQuestion, questions.length]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Don't reset feedback for previous questions
    }
  }, [currentQuestion]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return; // Prevent double submission
    
    // Validation checks
    if (!quizId) {
      toast({
        title: "Error",
        description: "Quiz ID is missing. Cannot submit quiz.",
        variant: "destructive",
      });
      return;
    }
    
    if (!questions || questions.length === 0) {
      toast({
        title: "Error",
        description: "No questions found for this quiz.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Submitting quiz", quizId, "with answers:", selectedAnswers);
      
      // Calculate how many answers are correct
      const correctAnswersCount = questions.reduce((count, question, index) => {
        const selectedAnswer = selectedAnswers[index];
        return selectedAnswer === question.correct_answer ? count + 1 : count;
      }, 0);

      // Calculate score as a percentage (0-100) instead of a decimal
      const scorePercentage = Math.round((correctAnswersCount / questions.length) * 100);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Authentication error:", sessionError);
        throw new Error("Authentication error");
      }
      
      if (!sessionData?.session?.user) {
        throw new Error("Not authenticated");
      }

      // Prepare topic performance data
      const topicPerformance: Record<string, { correct: number; total: number }> = {};
      questions.forEach((question, index) => {
        const topic = question.topic;
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0 };
        }
        topicPerformance[topic].total++;
        if (selectedAnswers[index] === question.correct_answer) {
          topicPerformance[topic].correct++;
        }
      });

      // Create initial AI feedback structure
      const initialAiFeedback = {
        strengths: [],
        areas_for_improvement: [],
        advice: ""
      };

      const { data, error } = await supabase
        .from('quiz_responses')
        .insert([
          {
            quiz_id: quizId,
            student_id: sessionData.session.user.id,
            score: scorePercentage,
            correct_answers: correctAnswersCount,
            total_questions: questions.length,
            topic_performance: topicPerformance,
            ai_feedback: initialAiFeedback,
            completed_at: new Date().toISOString()
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error submitting quiz:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Quiz submitted successfully!",
      });
      
      // Call the success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Ensure we navigate to the quiz results page with the new response ID
      console.log("Navigating to quiz results:", `/quiz-results/${data.id}`);
      navigate(`/quiz-results/${data.id}`);
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [quizId, questions, selectedAnswers, navigate, isSubmitting, onSubmitSuccess]);

  return {
    currentQuestion,
    selectedAnswers,
    isSubmitting,
    showFeedback,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmit,
  };
};
