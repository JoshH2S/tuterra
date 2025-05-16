
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Question } from "@/types/quiz-generation";
import { useQuizFileUpload } from "./useQuizFileUpload";
import { useQuizTopicsManagement } from "./useQuizTopicsManagement";
import { useQuizSettings } from "./useQuizSettings";
import { useQuizSubmission } from "./useQuizSubmission";
import { useQuizGenerationProgress } from "./useQuizGenerationProgress";

export const useQuizGeneration = () => {
  const { id: courseId } = useParams();
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  
  // Integrate specialized hooks
  const {
    topics,
    addTopic,
    updateTopic,
    removeTopic
  } = useQuizTopicsManagement();
  
  const {
    title,
    setTitle,
    duration,
    setDuration,
    selectedCourseId,
    setSelectedCourseId,
    difficulty,
    setDifficulty
  } = useQuizSettings();
  
  const {
    selectedFile,
    contentLength,
    fileError,
    isValidating,
    handleFileSelect,
    clearFile
  } = useQuizFileUpload();
  
  const {
    quizId,
    isProcessing,
    error,
    generationProgress,
    setError,
  } = useQuizGenerationProgress();
  
  const {
    handleSubmit: submitQuiz,
    handleRetry: retryQuiz
  } = useQuizSubmission();

  const handleSubmit = async () => {
    await submitQuiz({
      selectedFile,
      topics,
      title,
      duration,
      selectedCourseId,
      difficulty
    });
  };

  const handleRetry = () => {
    retryQuiz({
      selectedFile,
      topics,
      title,
      duration,
      selectedCourseId,
      difficulty
    });
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
    handleFileSelect: handleFileSelect,
    addTopic,
    updateTopic,
    removeTopic,
    handleSubmit,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
  };
};
