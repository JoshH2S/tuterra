
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
import { useQuizSubmission } from "@/hooks/quiz/useQuizSubmission";
import { useQuizTimer } from "@/hooks/quiz/useQuizTimer";

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  const { isSubmitting, handleSubmit } = useQuizSubmission();
  const { timeRemaining } = useQuizTimer(
    quiz?.duration_minutes ?? null,
    () => handleSubmit({ id: id!, questions, answers, quiz })
  );

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

  if (!quiz || !questions.length) return <div>Loading...</div>;

  return (
    <div className={`container mx-auto ${isMobile ? 'p-2' : 'py-6'} space-y-4`}>
      <Card className="animate-fadeIn">
        <QuizHeader 
          title={quiz?.title}
          timeRemaining={timeRemaining}
          onTimeUp={() => handleSubmit({ id: id!, questions, answers, quiz })}
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
            onClick={() => handleSubmit({ id: id!, questions, answers, quiz })}
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
