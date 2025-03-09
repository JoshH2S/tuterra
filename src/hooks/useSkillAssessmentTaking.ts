
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Type definitions for the assessment and questions
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

export const useSkillAssessmentTaking = (assessmentId: string | undefined) => {
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

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId || !user) return;

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
          .eq("id", assessmentId)
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
            metadata: { assessment_id: assessmentId },
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
  }, [assessmentId, user, toast]);

  // Timer countdown
  useEffect(() => {
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
        completed_at: new Date().toISOString(),
        level: assessment.level || "intermediate",
        tier: assessment.tier || userTier
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
          skill_scores: skillScores as Json,
          time_spent: totalTime - timeRemaining,
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

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!assessment?.questions) return 0;
    return (currentQuestionIndex + 1) / assessment.questions.length * 100;
  };

  const isLastQuestion = assessment ? 
    currentQuestionIndex === (assessment.questions?.length || 0) - 1 : 
    false;

  return {
    assessment,
    loading,
    currentQuestionIndex,
    answers,
    timeRemaining,
    totalTime,
    isSubmitting,
    error,
    submissionProgress,
    sections: getSections(),
    progress: getProgressPercentage(),
    isLastQuestion,
    currentQuestion: assessment?.questions?.[currentQuestionIndex],
    totalQuestions: assessment?.questions?.length || 0,
    handleAnswerChange,
    goToNextQuestion,
    goToPreviousQuestion,
    handleSubmit,
    setError
  };
};
