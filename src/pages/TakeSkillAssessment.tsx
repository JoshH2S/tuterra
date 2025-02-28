
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, Flag, Clock } from "lucide-react";

export default function TakeSkillAssessment() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 1 hour default
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id || !user) return;

      try {
        const { data, error } = await supabase
          .from("skill_assessments")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setAssessment(data);
        
        // Set timer based on question count (2 minutes per question, min 30 minutes, max 2 hours)
        const questionCount = data.questions?.length || 0;
        const calculatedTime = Math.max(30 * 60, Math.min(120 * 60, questionCount * 120));
        setTimeRemaining(calculatedTime);
      } catch (error) {
        console.error("Error fetching assessment:", error);
        toast({
          title: "Error",
          description: "Failed to load the assessment",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id, user, toast]);

  useEffect(() => {
    // Timer countdown
    if (timeRemaining <= 0 || !assessment) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, assessment]);

  const handleAnswerChange = (value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < (assessment?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let correctCount = 0;
      const questions = assessment.questions || [];
      
      const detailedResults = questions.map((question: any, index: number) => {
        const userAnswer = answers[index];
        const isCorrect = Array.isArray(userAnswer)
          ? JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswer.sort())
          : userAnswer === question.correctAnswer;
        
        if (isCorrect) correctCount++;
        
        return {
          question: question.question,
          correct: isCorrect,
          userAnswer,
          correctAnswer: question.correctAnswer,
          skill: question.skill || "General"
        };
      });
      
      const score = Math.round((correctCount / questions.length) * 100);
      
      // Save results
      const { data, error } = await supabase
        .from("skill_assessment_results")
        .insert({
          assessment_id: assessment.id,
          user_id: user.id,
          score,
          answers: answers,
          detailed_results: detailedResults,
          time_spent: assessment.time_limit ? assessment.time_limit - timeRemaining : null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Assessment completed",
        description: `Your score: ${score}%`,
      });
      
      // Navigate to results page
      navigate(`/skill-assessment-results/${data.id}`);
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit your answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Assessment not found</h2>
            <p className="mb-4">The assessment you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/skill-assessments")}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = assessment.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (assessment.questions?.length || 0) - 1;
  const progress = (currentQuestionIndex + 1) / (assessment.questions?.length || 1) * 100;

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{assessment.title}</h1>
        <div className="flex items-center text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Question {currentQuestionIndex + 1} of {assessment.questions?.length}</span>
            {currentQuestion?.skill && (
              <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                {currentQuestion.skill}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Select the best answer for each question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion && (
            <>
              <div className="text-lg font-medium mb-4">
                {currentQuestion.question}
              </div>

              {currentQuestion.type === 'multiple_choice' ? (
                <RadioGroup
                  value={answers[currentQuestionIndex] as string || ""}
                  onValueChange={(value) => handleAnswerChange(value)}
                  className="space-y-3"
                >
                  {Object.entries(currentQuestion.options).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center space-x-2 border p-3 rounded-md">
                      <RadioGroupItem value={key} id={`option-${key}`} />
                      <label 
                        htmlFor={`option-${key}`}
                        className="flex-1 cursor-pointer"
                      >
                        {value}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              ) : currentQuestion.type === 'multiple_answer' ? (
                <div className="space-y-3">
                  {Object.entries(currentQuestion.options).map(([key, value]: [string, any]) => {
                    const currentAnswers = (answers[currentQuestionIndex] as string[]) || [];
                    const isChecked = currentAnswers.includes(key);
                    
                    return (
                      <div key={key} className="flex items-start space-x-2 border p-3 rounded-md">
                        <Checkbox 
                          id={`option-${key}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleAnswerChange([...currentAnswers, key]);
                            } else {
                              handleAnswerChange(currentAnswers.filter(item => item !== key));
                            }
                          }}
                        />
                        <label
                          htmlFor={`option-${key}`}
                          className="flex-1 cursor-pointer"
                        >
                          {value}
                        </label>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>Question type not supported</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Flag className="mr-2 h-4 w-4" />
                Finish Assessment
              </>
            )}
          </Button>
        ) : (
          <Button onClick={goToNextQuestion}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
