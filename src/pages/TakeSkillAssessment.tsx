
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { AssessmentProgressTracker } from "@/components/skill-assessment/AssessmentProgress";
import { Json } from "@/integrations/supabase/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define proper types for our data
type SkillAssessment = {
  id: string;
  title: string;
  industry: string;
  role: string;
  description: string;
  questions: Array<{
    question: string;
    type: string;
    options: Record<string, string>;
    correctAnswer: string | string[];
    skill?: string;
  }>;
  time_limit?: number;
  level?: string;
  tier?: string;
};

// Type guards for answers validation
const isValidAnswer = (answer: unknown): answer is string | string[] => {
  return typeof answer === 'string' || 
    (Array.isArray(answer) && answer.every(item => typeof item === 'string'));
};

const validateAnswers = (answers: Record<number, unknown>): boolean => {
  return Object.values(answers).every(answer => isValidAnswer(answer));
};

export default function TakeSkillAssessment() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 1 hour default
  const [totalTime, setTotalTime] = useState<number>(3600); // 1 hour default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTier, setUserTier] = useState<string>("free");
  const [error, setError] = useState<string | null>(null);
  const [submissionProgress, setSubmissionProgress] = useState(0);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id || !user) return;

      try {
        // Get user's tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .maybeSingle();
        
        setUserTier(profile?.subscription_tier || 'free');
        
        // Get assessment
        const { data, error } = await supabase
          .from("skill_assessments")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        // Cast the JSON questions to the correct type
        const typedAssessment: SkillAssessment = {
          ...data,
          questions: data.questions as SkillAssessment['questions']
        };
        
        setAssessment(typedAssessment);
        
        // Set timer based on question count (2 minutes per question, min 30 minutes, max 2 hours)
        const questionCount = typedAssessment.questions?.length || 0;
        const calculatedTime = Math.max(30 * 60, Math.min(120 * 60, questionCount * 120));
        setTimeRemaining(calculatedTime);
        setTotalTime(calculatedTime);
        
        // Track assessment view
        try {
          await supabase.from('user_feature_interactions').insert({
            user_id: user.id,
            feature: 'skill-assessment-view',
            action: 'view',
            metadata: { assessment_id: id },
            timestamp: new Date().toISOString()
          });
        } catch (trackError) {
          console.error("Error tracking assessment view:", trackError);
          // Don't throw here, just log the error
        }
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
    if (assessment && currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment || !user) {
      setError("Assessment or user information is missing. Please refresh and try again.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSubmissionProgress(10);
    
    try {
      // Validate answers
      if (!validateAnswers(answers)) {
        throw new Error("Some answers have invalid format. Please check your responses.");
      }
      
      // Check for unanswered questions
      const unansweredQuestions = assessment.questions
        .map((_, index) => index)
        .filter(index => answers[index] === undefined);
        
      if (unansweredQuestions.length > 0) {
        setError(`Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`);
        setIsSubmitting(false);
        return;
      }
      
      setSubmissionProgress(30);
      
      // Calculate score
      let correctCount = 0;
      const questions = assessment.questions || [];
      
      const detailedResults = questions.map((question, index) => {
        const userAnswer = answers[index];
        let isCorrect = false;
        
        if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
          // Sort both arrays to ensure order doesn't matter for comparison
          const sortedUserAnswer = [...userAnswer].sort();
          const sortedCorrectAnswer = [...question.correctAnswer].sort();
          isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
        } else if (!Array.isArray(userAnswer) && !Array.isArray(question.correctAnswer)) {
          isCorrect = userAnswer === question.correctAnswer;
        }
        
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
      setSubmissionProgress(60);
      
      // Calculate skill scores
      const skillScores: Record<string, { correct: number, total: number, score: number }> = {};
      
      detailedResults.forEach(result => {
        const skill = result.skill;
        if (!skillScores[skill]) {
          skillScores[skill] = { correct: 0, total: 0, score: 0 };
        }
        
        skillScores[skill].total += 1;
        if (result.correct) {
          skillScores[skill].correct += 1;
        }
      });
      
      // Calculate percentages
      Object.keys(skillScores).forEach(skill => {
        const { correct, total } = skillScores[skill];
        skillScores[skill].score = Math.round((correct / total) * 100);
      });
      
      setSubmissionProgress(80);
      
      console.log("Preparing submission with data:", {
        assessment_id: assessment.id,
        user_id: user.id,
        score,
        answers,
        detailed_results: detailedResults,
        skill_scores: skillScores,
        time_spent: totalTime - timeRemaining,
        completed_at: new Date().toISOString()
      });
      
      // Save results
      const { data, error: saveError } = await supabase
        .from("skill_assessment_results")
        .insert({
          assessment_id: assessment.id,
          user_id: user.id,
          score,
          answers: answers as Json,
          detailed_results: detailedResults as Json,
          time_spent: totalTime - timeRemaining,
          skill_scores: skillScores as Json,
          level: assessment.level || "intermediate",
          tier: assessment.tier || userTier,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (saveError) {
        console.error("Database error when saving assessment results:", saveError);
        throw new Error(`Failed to save results: ${saveError.message}`);
      }
      
      setSubmissionProgress(90);
      
      // Track completion
      try {
        await supabase.from('user_feature_interactions').insert({
          user_id: user.id,
          feature: 'skill-assessment-completion',
          action: 'complete',
          metadata: { 
            assessment_id: assessment.id,
            score,
            time_spent: totalTime - timeRemaining
          },
          timestamp: new Date().toISOString()
        });
      } catch (trackError) {
        console.error("Error tracking assessment completion:", trackError);
        // Don't throw here to avoid disrupting the main flow
      }
      
      setSubmissionProgress(100);
      
      toast({
        title: "Assessment completed",
        description: `Your score: ${score}%`,
      });
      
      // Navigate to results page
      navigate(`/skill-assessment-results/${data.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error submitting assessment:", error);
      setError(`Failed to submit your answers: ${errorMessage}. Please try again.`);
      
      // Store failed submission in local storage for potential recovery
      try {
        localStorage.setItem(
          `failed_submission_${assessment.id}`,
          JSON.stringify({
            assessmentId: assessment.id,
            answers,
            timestamp: new Date().toISOString(),
            error: errorMessage
          })
        );
      } catch (storageError) {
        console.error("Could not save failed submission to local storage:", storageError);
      }
      
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

  // Prepare sections for progress tracker
  const getSections = () => {
    if (!assessment?.questions) return [];
    
    // Group questions by skill
    const skillGroups: Record<string, number> = {};
    assessment.questions.forEach(q => {
      const skill = q.skill || "General";
      if (!skillGroups[skill]) {
        skillGroups[skill] = 0;
      }
      skillGroups[skill]++;
    });
    
    // Create sections with weights based on question count
    return Object.entries(skillGroups).map(([skill, count]) => ({
      id: skill,
      label: skill,
      weight: count / assessment.questions.length
    }));
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{assessment.title}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-muted-foreground">
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
          {assessment.level && (
            <div className="px-2 py-1 bg-muted rounded text-xs font-medium capitalize">
              {assessment.level} level
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="md:grid md:grid-cols-4 gap-6">
        {/* Left sidebar with progress */}
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-4">
              <AssessmentProgressTracker 
                sections={getSections()}
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={assessment.questions?.length}
                timeRemaining={timeRemaining}
                totalTime={totalTime}
                hideTimer={true}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          {/* Mobile progress bar */}
          <div className="md:hidden">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {assessment.questions?.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="md:hidden">Question {currentQuestionIndex + 1}</span>
                <span className="hidden md:inline">Question {currentQuestionIndex + 1} of {assessment.questions?.length}</span>
                {currentQuestion?.skill && (
                  <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                    {currentQuestion.skill}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Select the best answer for this question
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
                      {Object.entries(currentQuestion.options).map(([key, value]) => (
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
                      {Object.entries(currentQuestion.options).map(([key, value]) => {
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
                    {submissionProgress > 0 ? `Submitting (${submissionProgress}%)` : 'Submitting...'}
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
      </div>
    </div>
  );
}
