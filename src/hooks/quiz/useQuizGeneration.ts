
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { shuffleQuestionsOptions } from "@/utils/quiz-helpers";
import { FILE_LIMITS } from "@/utils/file-limits";
import { useQuizFileUpload } from "./useQuizFileUpload";
import { QuestionDifficulty } from "@/types/quiz";
import { useQuizTopicsManagement } from "./useQuizTopicsManagement";
import { useQuizSettings } from "./useQuizSettings";
import { useQuizSubmission } from "./useQuizSubmission";

export interface Topic {
  description: string;
  numQuestions: number;
}

export interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  topic: string;
  points: number;
}

export const useQuizGeneration = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{
    stage: 'preparing' | 'analyzing' | 'generating' | 'saving' | 'complete' | 'error';
    percentComplete: number;
    message: string;
  }>({
    stage: 'preparing',
    percentComplete: 0,
    message: 'Preparing to generate quiz...'
  });
  const [error, setError] = useState<Error | null>(null);

  // Use our more focused hooks
  const { topics, addTopic, updateTopic, removeTopic } = useQuizTopicsManagement();
  const { title, duration, selectedCourseId, difficulty, setTitle, setDuration, setSelectedCourseId, setDifficulty } = useQuizSettings();
  const { handleSubmit: submitQuiz } = useQuizSubmission();

  // Integrate the improved file upload hook
  const {
    selectedFile,
    contentLength,
    fileError,
    isValidating,
    handleFileSelect: selectFile,
    clearFile
  } = useQuizFileUpload();

  const resetProgress = () => {
    setGenerationProgress({
      stage: 'preparing',
      percentComplete: 0,
      message: 'Preparing to generate quiz...'
    });
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    if (topics.some(topic => !topic.description)) {
      toast({
        title: "Error",
        description: "Please fill out all topics",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setQuizQuestions([]);
    setError(null);
    resetProgress();

    try {
      // Read the file content
      const fileContent = await selectedFile.text();
      
      // Submit the quiz
      const result = await submitQuiz(
        fileContent, 
        topics, 
        difficulty as QuestionDifficulty, 
        title,
        duration, 
        selectedCourseId
      );

      if (result.error) {
        throw result.error;
      }

      // We'll get the quizId and questions from the submission response if needed

    } catch (error) {
      console.error('Error processing quiz:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      setGenerationProgress({
        stage: 'error',
        percentComplete: 0,
        message: 'Error generating quiz'
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit();
  };

  return {
    title,
    selectedFile,
    topics,
    isProcessing,
    quizQuestions,
    quizId,
    contentLength,
    duration,
    selectedCourseId,
    difficulty,
    generationProgress,
    error,
    isValidating,
    fileError,
    handleRetry,
    setTitle,
    handleFileSelect: selectFile,
    addTopic,
    updateTopic,
    removeTopic,
    handleSubmit,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
    resetProgress
  };
};
