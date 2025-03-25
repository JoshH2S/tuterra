
import { useState } from "react";
import { QuestionItem } from "./types";

export const useAssessmentNavigation = (questions: QuestionItem[] = []) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

  const handleAnswerChange = (value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex + 1) / totalQuestions * 100 : 0;

  // Prepare sections for progress tracker
  const getSections = () => {
    if (!questions.length) return [];
    
    // Group questions by skill
    const skillGroups: Record<string, number> = {};
    questions.forEach(q => {
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
      weight: count / questions.length
    }));
  };

  return {
    currentQuestionIndex,
    answers,
    isLastQuestion,
    currentQuestion,
    totalQuestions,
    progress,
    sections: getSections(),
    handleAnswerChange,
    goToNextQuestion,
    goToPreviousQuestion
  };
};
