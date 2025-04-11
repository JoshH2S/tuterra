
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuizQuestion } from "./quizTypes";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/quiz-generation";

interface QuizSubmitParams {
  quizId: string;
  questions: QuizQuestion[] | Question[];
  onQuizSubmitted?: () => void;
}

export const useQuizSubmit = ({ quizId, questions, onQuizSubmitted }: QuizSubmitParams) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmitQuiz = async (selectedAnswers: Record<number, string>) => {
    if (!quizId) {
      toast({
        title: "Error",
        description: "No quiz ID provided",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting quiz:", { quizId, selectedAnswers, questionCount: questions.length });
      
      // Get user session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a quiz",
          variant: "destructive",
        });
        return;
      }
      
      // Calculate score and prepare response data
      let correctAnswers = 0;
      let totalPoints = 0;
      
      // Handle different question formats (from different question types)
      const questionResponses = questions.map((question, index) => {
        const userAnswer = selectedAnswers[index] || "";
        const correctAnswer = 'correct_answer' in question 
          ? question.correct_answer 
          : ('correctAnswer' in question ? question.correctAnswer : "");
          
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
          correctAnswers++;
          totalPoints += question.points || 1;
        }
        
        return {
          question_id: question.id || `question_${index}`,
          student_answer: userAnswer,
          is_correct: isCorrect,
          topic: question.topic || "general"
        };
      });

      const score = Math.round((correctAnswers / questions.length) * 100);
      
      // Prepare topic performance data
      const topicPerformance: Record<string, { correct: number; total: number }> = {};
      
      questionResponses.forEach(response => {
        const topic = response.topic;
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { correct: 0, total: 0 };
        }
        topicPerformance[topic].total += 1;
        if (response.is_correct) {
          topicPerformance[topic].correct += 1;
        }
      });
      
      // Create quiz response
      const responseData = {
        quiz_id: quizId,
        student_id: userId,
        score,
        correct_answers: correctAnswers,
        total_questions: questions.length,
        topic_performance: topicPerformance,
        completed_at: new Date().toISOString(),
        total_points: totalPoints
      };

      console.log("Inserting quiz response:", responseData);

      // Insert the response data into the database
      const { data: response, error } = await supabase
        .from('quiz_responses')
        .insert(responseData)
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }

      console.log("Quiz response saved successfully:", response);

      // Insert individual question responses
      if (response?.id) {
        const questionResponsesWithId = questionResponses.map(qr => ({
          ...qr,
          quiz_response_id: response.id
        }));
        
        const { error: questionsError } = await supabase
          .from('question_responses')
          .insert(questionResponsesWithId);
          
        if (questionsError) {
          console.error("Error saving question responses:", questionsError);
        }
      }

      toast({
        title: "Quiz Submitted",
        description: `Your score: ${score}%`,
      });

      // Call the callback function to notify parent components if provided
      if (onQuizSubmitted) {
        onQuizSubmitted();
      }
      
      // Navigate to quiz results page with the response ID
      navigate(`/quizzes/quiz-results/${response.id}`);
    } catch (error) {
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
    isSubmitting,
    handleSubmitQuiz,
  };
};
