
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { QuestionDifficulty } from "@/types/quiz";
import { Topic, Question, QuizSettings } from "@/types/quiz-generation";
import { useQuizFileUpload } from "./useQuizFileUpload";
import { useQuizTopics } from "./useQuizTopics";
import { useQuizSettings } from "./useQuizSettings";
import { useQuizSubmission } from "./useQuizSubmission";

// Define the progress type for quiz generation
interface QuizGenerationProgress {
  stage: 'preparing' | 'analyzing' | 'generating' | 'saving' | 'complete' | 'error';
  percentComplete: number;
  message: string;
}

export const useQuizGeneration = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [generationProgress, setGenerationProgress] = useState<QuizGenerationProgress>({
    stage: 'preparing',
    percentComplete: 0,
    message: 'Preparing your quiz...'
  });
  
  // Use the refactored hooks
  const { selectedFile, contentLength, handleFileSelect } = useQuizFileUpload();
  
  const { 
    topics, 
    addTopic, 
    updateTopic, 
    removeTopic 
  } = useQuizTopics();
  
  const {
    title,
    duration,
    selectedCourseId,
    difficulty,
    setTitle,
    setDuration,
    setSelectedCourseId,
    setDifficulty
  } = useQuizSettings();
  
  const {
    isProcessing,
    quizQuestions,
    quizId,
    error,
    handleSubmit,
    retrySubmission
  } = useQuizSubmission();

  const updateGenerationProgress = (stage: QuizGenerationProgress['stage'], percentComplete: number, message: string) => {
    setGenerationProgress({
      stage,
      percentComplete,
      message
    });
  };

  const handleRetry = () => {
    if (selectedFile && selectedCourseId) {
      updateGenerationProgress('preparing', 0, 'Preparing your quiz...');
      return retrySubmission(
        selectedFile.text(),
        topics,
        difficulty,
        title,
        duration,
        selectedCourseId === 'none' ? undefined : selectedCourseId
      );
    }
    return { error: new Error("Missing required data for retry") };
  };

  const handleGenerateQuiz = async () => {
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

    updateGenerationProgress('preparing', 10, 'Preparing your quiz...');
    
    const fileContent = await selectedFile.text();
    
    updateGenerationProgress('analyzing', 30, 'Analyzing content...');
    
    const result = await handleSubmit(
      fileContent,
      topics,
      difficulty,
      title,
      duration,
      selectedCourseId === 'none' ? undefined : selectedCourseId
    );
    
    if (result.error) {
      updateGenerationProgress('error', 100, 'Error generating quiz');
    } else {
      updateGenerationProgress('complete', 100, 'Quiz generated successfully!');
    }
    
    return result;
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
    handleRetry,
    setTitle,
    handleFileSelect,
    addTopic,
    updateTopic,
    removeTopic,
    handleSubmit: handleGenerateQuiz,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
  };
};
