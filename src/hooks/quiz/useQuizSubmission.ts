
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface QuizSubmissionData {
  id: string;
  questions: any[];
  answers: Record<string, string>;
  quiz: any;
}

interface TopicPerformance {
  total: number;
  correct: number;
}

export const useQuizSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const calculateTopicPerformance = (questions: any[], answers: Record<string, string>) => {
    const topicPerformance = questions.reduce<Record<string, TopicPerformance>>((acc, question) => {
      const topic = question.topic;
      if (!acc[topic]) {
        acc[topic] = { total: 0, correct: 0 };
      }
      acc[topic].total++;
      if (answers[question.id] === question.correct_answer) {
        acc[topic].correct++;
      }
      return acc;
    }, {});

    return Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      total: data.total,
      correct: data.correct,
      percentage: (data.correct / data.total) * 100
    }));
  };

  const handleSubmit = async ({ id, questions, answers, quiz }: QuizSubmissionData) => {
    try {
      setIsSubmitting(true);

      const questionResponses = questions.map(question => ({
        question_id: question.id,
        student_answer: answers[question.id] || null,
        is_correct: answers[question.id] === question.correct_answer,
        topic: question.topic
      }));

      const correctAnswers = questionResponses.filter(response => response.is_correct).length;
      const totalQuestions = questions.length;
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const score = Math.round((correctAnswers / totalQuestions) * totalPoints);

      const topicPerformanceArray = calculateTopicPerformance(questions, answers);

      const { data: quizResponse, error: responseError } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: id,
          student_id: (await supabase.auth.getUser()).data.user?.id,
          score: score,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          completed_at: new Date().toISOString(),
          topic_performance: topicPerformanceArray
        })
        .select()
        .single();

      if (responseError) throw responseError;

      const { error: scoreError } = await supabase
        .from('student_quiz_scores')
        .insert({
          quiz_id: id,
          student_id: (await supabase.auth.getUser()).data.user?.id,
          course_id: quiz.course_id,
          score: score,
          max_score: totalPoints
        });

      if (scoreError) throw scoreError;

      const { error: questionResponseError } = await supabase
        .from('question_responses')
        .insert(questionResponses.map(response => ({
          ...response,
          quiz_response_id: quizResponse.id,
          topic: response.topic
        })));

      if (questionResponseError) throw questionResponseError;

      await generateQuizFeedback(quizResponse.id, correctAnswers, totalQuestions, score, questionResponses);

      navigate(`/quiz-results/${quizResponse.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};

async function generateQuizFeedback(
  quizResponseId: string,
  correctAnswers: number,
  totalQuestions: number,
  score: number,
  questionResponses: any[]
) {
  const feedbackResponse = await fetch(
    'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-quiz-feedback',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        quizResponseId,
        correctAnswers,
        totalQuestions,
        score,
        questionResponses,
      }),
    }
  );

  if (!feedbackResponse.ok) {
    console.error('Error generating feedback:', await feedbackResponse.text());
  }
}
