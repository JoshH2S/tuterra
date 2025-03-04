
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
  // Initialize with empty object to ensure no pre-selected answers
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, string>>({});
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const navigate = useNavigate();

  // Reset state when quiz changes - ensure no pre-selected answers
  useEffect(() => {
    if (quizId && questions.length > 0) {
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setExplanations({});
      setIsSubmitting(false);
      setShowFeedback(false);
      setIsGeneratingExplanation(false);
    }
  }, [quizId, questions]);

  // Generate an explanation for the answer
  const generateExplanation = useCallback(async (
    questionIndex: number, 
    question: QuizQuestion, 
    selectedAnswer: string
  ) => {
    if (!question) return;
    
    // If there's already an explanation from the database, use that
    if (question.explanation) {
      setExplanations(prev => ({ ...prev, [questionIndex]: question.explanation! }));
      return;
    }
    
    setIsGeneratingExplanation(true);
    try {
      const isCorrect = selectedAnswer === question.correct_answer;
      const selectedText = question.options[selectedAnswer];
      const correctText = question.options[question.correct_answer];
      
      const { data, error } = await supabase.functions.invoke('process-with-openai', {
        body: {
          prompt: `You are an educational assistant providing feedback on quiz answers.
          
          The question was: "${question.question}"
          
          The available options were:
          ${Object.entries(question.options).map(([key, value]) => `${key}: ${value}`).join('\n')}
          
          The correct answer is: ${question.correct_answer} (${correctText})
          
          The student selected: ${selectedAnswer} (${selectedText})
          
          ${isCorrect ? 
            "The student answered correctly. Explain why this is the correct answer in 2-3 sentences. Use an encouraging, positive tone." : 
            "The student answered incorrectly. Explain why their answer is wrong and why the correct answer is right in 2-3 sentences. Be supportive and educational."
          }
          
          Your explanation should be concise, educational, and help the student understand the concept better.`,
          temperature: 0.7,
          max_tokens: 150
        }
      });
      
      if (error) throw error;
      
      if (data && data.response) {
        setExplanations(prev => ({ ...prev, [questionIndex]: data.response }));
      }
    } catch (error) {
      console.error("Error generating explanation:", error);
      // Still set the feedback even if explanation fails
      setExplanations(prev => ({ 
        ...prev, 
        [questionIndex]: "Sorry, we couldn't generate an explanation for this answer." 
      }));
    } finally {
      setIsGeneratingExplanation(false);
    }
  }, []);

  const handleAnswerSelect = useCallback((questionIndex: number, answer: string) => {
    if (showFeedback && selectedAnswers[questionIndex]) return; // Don't allow changing answer after feedback is shown
    
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowFeedback(true); // Show feedback immediately after selecting an answer
    
    // Generate explanation for this answer
    if (questions[questionIndex]) {
      generateExplanation(questionIndex, questions[questionIndex], answer);
    }
  }, [showFeedback, questions, generateExplanation]);

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
    explanations,
    isGeneratingExplanation,
    handleAnswerSelect,
    handleNextQuestion,
    handlePreviousQuestion,
    handleSubmit,
  };
};
