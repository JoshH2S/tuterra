
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useQuizSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitQuiz = async (quizId: string, answers: Record<string, string>, timer: number | null = null) => {
    setIsSubmitting(true);
    
    try {
      // First, get the quiz data to calculate the score
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select(`
          id,
          title,
          quiz_questions (
            id,
            question,
            correct_answer,
            options,
            topic,
            points,
            difficulty
          )
        `)
        .eq("id", quizId)
        .single();

      if (quizError) {
        throw new Error(`Failed to fetch quiz data: ${quizError.message}`);
      }

      // Calculate score and collect data for question responses
      const questions = quizData.quiz_questions;
      const totalQuestions = questions.length;
      let correctAnswers = 0;
      
      // Track performance by topic
      const topicPerformance = {};
      
      // Create question responses
      const questionResponses = questions.map(question => {
        const studentAnswer = answers[question.id];
        const isCorrect = studentAnswer === question.correct_answer;
        
        if (isCorrect) {
          correctAnswers++;
        }
        
        // Record topic performance
        if (question.topic) {
          if (!topicPerformance[question.topic]) {
            topicPerformance[question.topic] = {
              correct: 0,
              total: 0
            };
          }
          
          topicPerformance[question.topic].total++;
          if (isCorrect) {
            topicPerformance[question.topic].correct++;
          }
        }
        
        return {
          question_id: question.id,
          student_answer: studentAnswer,
          is_correct: isCorrect,
          topic: question.topic
        };
      });
      
      // Calculate percentage score
      const score = Math.round((correctAnswers / totalQuestions) * 100);

      // Submit quiz response
      const { data: responseData, error: responseError } = await supabase
        .from("quiz_responses")
        .insert({
          quiz_id: quizId,
          student_id: (await supabase.auth.getUser()).data.user?.id,
          start_time: new Date(Date.now() - (timer || 0) * 1000).toISOString(),
          completed_at: new Date().toISOString(),
          score,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          topic_performance: topicPerformance
        })
        .select()
        .single();

      if (responseError) {
        throw new Error(`Failed to submit quiz: ${responseError.message}`);
      }

      // Submit individual question responses
      const { error: questionsError } = await supabase
        .from("question_responses")
        .insert(
          questionResponses.map(qr => ({
            ...qr,
            quiz_response_id: responseData.id
          }))
        );

      if (questionsError) {
        console.error("Error submitting question responses:", questionsError);
        // Continue execution - this is not a critical failure
      }

      // Generate AI feedback for the quiz response
      try {
        await supabase.functions.invoke('generate-quiz-feedback', {
          body: { quizResponseId: responseData.id }
        });
      } catch (feedbackError) {
        console.error("Error generating AI feedback:", feedbackError);
        // Continue execution - feedback generation is not critical for submission
      }

      toast({
        title: "Quiz Submitted",
        description: "Your quiz has been submitted successfully.",
      });

      // Navigate to the quiz results page
      navigate(`/quiz-results/${responseData.id}`);
      return responseData;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitQuiz, isSubmitting };
};
