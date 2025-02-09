
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Timer } from "lucide-react";

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Get quiz details
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

        // Set initial time remaining if duration is set
        if (quizData.duration_minutes > 0) {
          setTimeRemaining(quizData.duration_minutes * 60);
        }

        // Get quiz questions
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', id);

        if (questionError) throw questionError;
        setQuestions(questionData);

        // Record quiz start time
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

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Calculate correct answers and total questions
      const questionResponses = questions.map(question => ({
        question_id: question.id,
        student_answer: answers[question.id] || null,
        is_correct: answers[question.id] === question.correct_answer
      }));

      const correctAnswers = questionResponses.filter(response => response.is_correct).length;
      const totalQuestions = questions.length;
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const score = Math.round((correctAnswers / totalQuestions) * totalPoints);

      // Create quiz response
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

      // Submit individual question responses
      const { error: questionResponseError } = await supabase
        .from('question_responses')
        .insert(questionResponses.map(response => ({
          ...response,
          quiz_response_id: quizResponse.id
        })));

      if (questionResponseError) throw questionResponseError;

      // Generate AI feedback
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

      // Navigate to results page
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
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{quiz.title}</CardTitle>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Timer className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {timeRemaining === 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Time's up! Your quiz has been automatically submitted.
              </AlertDescription>
            </Alert>
          )}
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-start gap-2">
                <span className="font-medium">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium">{question.question}</p>
                  <RadioGroup
                    value={answers[question.id]}
                    onValueChange={(value) => 
                      setAnswers(prev => ({ ...prev, [question.id]: value }))
                    }
                    className="mt-2"
                  >
                    {Object.entries(question.options as Record<string, string>).map(([option, text]) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`}>
                          {text as string}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          ))}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || timeRemaining === 0}
            className="mt-6"
          >
            Submit Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
