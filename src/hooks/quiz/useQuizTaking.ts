import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/types/quiz";
import { toast } from "@/hooks/use-toast";

export const useQuizTaking = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<{ id: string; title: string; duration_minutes: number } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number; percentage: number } | null>(null);
  const [topicPerformance, setTopicPerformance] = useState<Record<string, { correct: number; total: number }>>({});
  const [explanationLoading, setExplanationLoading] = useState<Record<number, boolean>>({});
  const [explanations, setExplanations] = useState<Record<number, string>>({});

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        
        // Fetch quiz details
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();

        if (quizError) throw quizError;
        
        // Fetch quiz questions
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('id');

        if (questionError) throw questionError;

        // Transform question data to match our Question type
        const formattedQuestions = questionData.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
          topic: q.topic,
          points: q.points,
          explanation: q.explanation,
          difficulty: quizData.difficulty
        }));

        setQuiz(quizData);
        setQuestions(formattedQuestions);
        setTimeRemaining(quizData.duration_minutes * 60); // Convert minutes to seconds
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load quiz. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0 || quizSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, quizSubmitted]);

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    if (quizSubmitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    const topicResults: Record<string, { correct: number; total: number }> = {};

    questions.forEach((question, index) => {
      const topic = question.topic || 'general';
      const userAnswer = selectedAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (!topicResults[topic]) {
        topicResults[topic] = { correct: 0, total: 0 };
      }
      
      topicResults[topic].total += 1;
      
      if (isCorrect) {
        correctCount += 1;
        topicResults[topic].correct += 1;
      }
    });

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    return {
      score: { correct: correctCount, total: totalQuestions, percentage },
      topicPerformance: topicResults
    };
  };

  const handleSubmitQuiz = async () => {
    if (quizSubmitted) return;
    
    const { score: calculatedScore, topicPerformance: calculatedTopicPerformance } = calculateScore();
    
    setScore(calculatedScore);
    setTopicPerformance(calculatedTopicPerformance);
    setQuizSubmitted(true);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Save quiz attempt
        const { error } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_id: quizId,
            user_id: session.user.id,
            score: calculatedScore.percentage,
            answers: selectedAnswers,
            completed: true,
            topic_performance: calculatedTopicPerformance
          });

        if (error) {
          console.error('Error saving quiz attempt:', error);
        }
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  const loadExplanation = async (questionIndex: number) => {
    // If we already have an explanation or it's loading, don't fetch again
    if (explanations[questionIndex] || explanationLoading[questionIndex]) return;
    
    const question = questions[questionIndex];
    if (!question) return;
    
    // If the question already has an explanation, use that
    if (question.explanation) {
      setExplanations(prev => ({
        ...prev,
        [questionIndex]: question.explanation || ''
      }));
      return;
    }
    
    // Otherwise, generate an explanation
    setExplanationLoading(prev => ({ ...prev, [questionIndex]: true }));
    
    try {
      const userAnswer = selectedAnswers[questionIndex];
      const isCorrect = userAnswer === question.correctAnswer;
      
      const prompt = `
Question: ${question.question}
Options:
A: ${question.options.A}
B: ${question.options.B}
C: ${question.options.C}
D: ${question.options.D}
Correct answer: ${question.correctAnswer}
User's answer: ${userAnswer || 'Not answered'}
User was: ${isCorrect ? 'Correct' : 'Incorrect'}

Please explain why the correct answer is ${question.correctAnswer} and why the other options are incorrect.
`;

      const response = await fetch(
        'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/process-with-openai',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            difficulty: question.difficulty || 'university'
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const data = await response.json();
      
      setExplanations(prev => ({
        ...prev,
        [questionIndex]: data.response || 'No explanation available.'
      }));
    } catch (err) {
      console.error('Error loading explanation:', err);
      setExplanations(prev => ({
        ...prev,
        [questionIndex]: 'Failed to load explanation. Please try again.'
      }));
    } finally {
      setExplanationLoading(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

  return {
    quiz,
    questions,
    loading,
    error,
    selectedAnswers,
    currentQuestionIndex,
    timeRemaining,
    quizSubmitted,
    score,
    topicPerformance,
    explanationLoading,
    explanations,
    handleSelectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    handleSubmitQuiz,
    loadExplanation
  };
};
