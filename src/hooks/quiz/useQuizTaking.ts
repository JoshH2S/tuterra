
import { useState } from "react";
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
}

export const useQuizTaking = (quizId: string, questions: QuizQuestion[]) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answer });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    try {
      const correctAnswersCount = questions.reduce((count, question, index) => {
        const selectedAnswer = selectedAnswers[index];
        return selectedAnswer === question.correct_answer ? count + 1 : count;
      }, 0);

      // Calculate score as a percentage (0-100) instead of a decimal
      const scorePercentage = Math.round((correctAnswersCount / questions.length) * 100);

      const { data: sessionData } = await supabase.auth.getSession();
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

      const { data, error } = await supabase
        .from('quiz_responses')
        .insert([
          {
            quiz_id: quizId,
            student_id: sessionData.session.user.id,
            score: scorePercentage, // Use integer percentage (0-100) instead of decimal
            correct_answers: correctAnswersCount,
            total_questions: questions.length,
            topic_performance: topicPerformance,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Quiz submitted successfully!",
      });
      
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
  };

  return {
    currentQuestion,
    selectedAnswers,
    isSubmitting,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmit,
  };
};
