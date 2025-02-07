
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Get quiz questions
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', id);

        if (questionError) throw questionError;
        setQuestions(questionData);
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
          score,
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
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`}>
                          {option}
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
            disabled={isSubmitting}
            className="mt-6"
          >
            Submit Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
