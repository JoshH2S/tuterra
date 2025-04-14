import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { 
  SkillAssessment, 
  QuestionItem, 
  QuestionResult, 
  SkillScores, 
  validateAnswers 
} from "./types";

export const useAssessmentSubmission = (
  assessment: SkillAssessment | null,
  answers: Array<string | string[]>,
  totalTime: number,
  timeRemaining: number,
  userTier: string
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionProgress, setSubmissionProgress] = useState(0);

  const convertAnswersToRecord = (): Record<number, string | string[]> => {
    const record: Record<number, string | string[]> = {};
    answers.forEach((answer, index) => {
      if (answer !== undefined) {
        record[index] = answer;
      }
    });
    return record;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!assessment || !user) {
      setError("Assessment or user information is missing. Please refresh and try again.");
      return Promise.reject(new Error("Assessment or user information is missing"));
    }
    
    setIsSubmitting(true);
    setError(null);
    setSubmissionProgress(10);
    
    try {
      if (!validateAnswers(answers)) {
        throw new Error("Some answers have invalid format. Please check your responses.");
      }
      
      const unansweredQuestions = assessment.questions
        .map((_, index) => index)
        .filter(index => answers[index] === undefined);
        
      if (unansweredQuestions.length > 0) {
        setError(`Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`);
        setIsSubmitting(false);
        return Promise.reject(new Error("Unanswered questions"));
      }
      
      setSubmissionProgress(30);
      
      let correctCount = 0;
      const questions = assessment.questions || [];
      
      const detailedResults = questions.map((question, index) => {
        const userAnswer = answers[index];
        let isCorrect = false;
        
        if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
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
      
      const skillScores: SkillScores = {};
      
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
      
      Object.keys(skillScores).forEach(skill => {
        const { correct, total } = skillScores[skill];
        skillScores[skill].score = Math.round((correct / total) * 100);
      });
      
      setSubmissionProgress(80);
      
      const answersRecord = convertAnswersToRecord();
      
      console.log("Preparing submission with data:", {
        assessment_id: assessment.id,
        user_id: user.id,
        score,
        answers: answersRecord,
        detailed_results: detailedResults,
        skill_scores: skillScores,
        time_spent: totalTime - timeRemaining,
        completed_at: new Date().toISOString(),
        level: assessment.level || "intermediate",
        tier: assessment.tier || userTier
      });
      
      const { data, error: saveError } = await supabase
        .from("skill_assessment_results")
        .insert({
          assessment_id: assessment.id,
          user_id: user.id,
          score,
          answers: answersRecord as Json,
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
      }
      
      setSubmissionProgress(100);
      
      toast({
        title: "Assessment completed",
        description: `Your score: ${score}%`,
      });
      
      navigate(`/assessments/skill-assessment-results/${data.id}`);
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error submitting assessment:", error);
      setError(`Failed to submit your answers: ${errorMessage}. Please try again.`);
      
      try {
        localStorage.setItem(
          `failed_submission_${assessment.id}`,
          JSON.stringify({
            assessmentId: assessment.id,
            answers: convertAnswersToRecord(),
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
      
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    setError,
    submissionProgress,
    handleSubmit
  };
};
