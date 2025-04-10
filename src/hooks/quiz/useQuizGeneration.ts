
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { QuestionDifficulty } from "@/types/quiz";
import { Topic, Question } from "@/types/quiz-generation";
import { useQuizFile } from "./useQuizFile";
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
  const { selectedFile, contentLength, fileError, handleFileSelect } = useQuizFile();
  
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
      // First get the text content and then pass it
      selectedFile.text().then(fileContent => {
        return retrySubmission(
          fileContent,
          topics,
          difficulty,
          title,
          duration,
          selectedCourseId === 'none' ? undefined : selectedCourseId
        );
      }).catch(error => {
        console.error("Error reading file text:", error);
        return { error: new Error("Failed to read file content") };
      });
      return { success: true };
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
    
    try {
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
    } catch (error) {
      console.error("Error generating quiz:", error);
      updateGenerationProgress('error', 100, 'Error generating quiz');
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
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
    fileError,
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
