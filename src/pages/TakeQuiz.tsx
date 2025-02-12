import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuizHeader } from "@/components/quiz-taking/QuizHeader";
import { QuizQuestion } from "@/components/quiz-taking/QuizQuestion";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', id)
          .eq('published', true)
          .single();

        if (quizError) throw quizError;
        if (!quizData) {
          toast({
            title: "Error",
            description: "Quiz not found or not published",
            variant: "destructive",
          });
          navigate('/quizzes');
          return;
        }

        setQuiz(quizData);

        if (quizData.duration_minutes > 0) {
          setTimeRemaining(quizData.duration_minutes * 60);
        }

        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', id);

        if (questionError) throw questionError;
        setQuestions(questionData);

        if (quizData.duration_minutes > 0) {
          const { error: startError } = await supabase
            .from('quiz_responses')
            .insert({
              quiz_id: id,
              student_id: (await supabase.auth.getUser()).data.user?.id,
              start_time: new Date().toISOString()
            });

          if (startError) throw startError;
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive",
        });
      }
    };

    fetchQuiz();
  }, [id, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const questionResponses = questions.map(question => ({
        question_id: question.id,
        student_answer: answers[question.id] || null,
        is_correct: answers[question.id] === question.correct_answer
      }));

      const correctAnswers = questionResponses.filter(response => response.is_correct).length;
      const totalQuestions = questions.length;
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const score = Math.round((correctAnswers / totalQuestions) * totalPoints);

      const { data: quizResponse, error: responseError } = await supabase
        .from('quiz_responses')
        .insert({
          quiz_id: id,
          student_id: (await supabase.auth.getUser()).data.user?.id,
          score: score,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (responseError) throw responseError;

      const { error: questionResponseError } = await supabase
        .from('question_responses')
        .insert(questionResponses.map(response => ({
          ...response,
          quiz_response_id: quizResponse.id
        })));

      if (questionResponseError) throw questionResponseError;

      const feedbackResponse = await fetch(
        'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-quiz-feedback',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            quizResponseId: quizResponse.id,
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

  if (!quiz || !questions.length) return <div>Loading...</div>;

  return (
    <div className={`container mx-auto ${isMobile ? 'p-2' : 'py-6'} space-y-4`}>
      <Card className="animate-fadeIn">
        <QuizHeader 
          title={quiz?.title}
          timeRemaining={timeRemaining}
          onTimeUp={handleSubmit}
        />
        <CardContent className={`space-y-6 ${isMobile ? 'p-3' : ''}`}>
          {timeRemaining === 0 && (
            <Alert variant="destructive" className={isMobile ? 'p-3' : ''}>
              <AlertDescription className={isMobile ? 'text-sm' : ''}>
                Time's up! Your quiz has been automatically submitted.
              </AlertDescription>
            </Alert>
          )}
          {questions.map((question, index) => (
            <QuizQuestion
              key={question.id}
              question={question}
              index={index}
              selectedAnswer={answers[question.id] || ''}
              onAnswerChange={(questionId, answer) => 
                setAnswers(prev => ({ ...prev, [questionId]: answer }))
              }
            />
          ))}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || timeRemaining === 0}
            className={`mt-6 ${isMobile ? 'w-full py-6 text-base' : ''}`}
          >
            Submit Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
