
import { useState } from "react";
import { useQuizAPI } from "./useQuizAPI";
import { useQuizSave } from "./useQuizSave";
import { toast } from "@/components/ui/use-toast";
import { Topic, Question, CONTENT_LIMITS } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";
import { useQuizSubmission } from "./useQuizSubmission";

export const useQuizTaking = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const { isProcessing, quizQuestions, handleSubmit } = useQuizSubmission();
  
  const selectAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async (fileContent: string, topics: Topic[], difficulty: QuestionDifficulty, title: string, duration: number, courseId?: string) => {
    return handleSubmit(fileContent, topics, difficulty, title, duration, courseId);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalPoints = 0;

    quizQuestions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++;
        totalPoints += question.points || 1;
      }
    });

    return {
      correctAnswers,
      totalQuestions: quizQuestions.length,
      percentage: Math.round((correctAnswers / quizQuestions.length) * 100),
      totalPoints
    };
  };

  return {
    currentQuestionIndex,
    selectedAnswers,
    quizCompleted,
    timeRemaining,
    quizQuestions,
    isProcessing,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    submitQuiz,
    calculateScore,
    setQuizCompleted,
    setTimeRemaining
  };
};
