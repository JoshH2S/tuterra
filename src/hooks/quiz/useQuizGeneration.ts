
import { useState } from "react";
import { Topic, Question } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";
import { useQuizSubmission } from "./useQuizSubmission";
import { useQuizFileUpload } from "./useQuizFileUpload";
import { useQuizTopics } from "./useQuizTopics";
import { useQuizSettings } from "./useQuizSettings";
import { useUserCredits } from "@/hooks/useUserCredits";

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'saving' | 'error';
  percent: number;
  message: string;
}

export const useQuizGeneration = () => {
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
    topics,
    addTopic,
    updateTopic,
    removeTopic
  } = useQuizTopics();
  
  const { 
    selectedFile, 
    contentLength, 
    handleFileSelect 
  } = useQuizFileUpload();
  
  const {
    isProcessing,
    quizQuestions,
    quizId,
    error,
    handleSubmit: submitQuiz,
    retrySubmission
  } = useQuizSubmission();

  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'idle',
    percent: 0,
    message: ''
  });
  const [showUpgradePrompt, setShowUpgradePrompt] = useState<boolean>(false);
  
  const { checkCredits, decrementCredits } = useUserCredits();

  const processFile = async () => {
    if (!selectedFile) return null;
    try {
      const content = await selectedFile.text();
      return {
        content: content,
        wasContentTrimmed: false,
        originalLength: content.length
      };
    } catch (error) {
      console.error("Error processing file:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Check if user has enough credits
    if (!checkCredits('quiz_credits')) {
      setShowUpgradePrompt(true);
      return;
    }

    try {
      // Start with analyzing stage
      setGenerationProgress({
        stage: 'analyzing',
        percent: 20,
        message: 'Analyzing your content and preparing questions...'
      });
      
      if (!selectedFile) {
        throw new Error("Please select a file first");
      }

      const processedFile = await processFile();
      
      if (!processedFile || !processedFile.content) {
        throw new Error("Failed to process file");
      }

      // Move to generating stage
      setGenerationProgress({
        stage: 'generating',
        percent: 50,
        message: 'Generating quiz questions based on your topics...'
      });

      const effectiveCourseId = selectedCourseId;
      
      // Submit quiz for generation
      const result = await submitQuiz(
        processedFile.content,
        topics.filter(t => !!t.description),
        difficulty,
        title,
        duration,
        effectiveCourseId
      );

      if (result.error) {
        // Move to error stage
        setGenerationProgress({
          stage: 'error',
          percent: 100,
          message: `Failed to generate quiz: ${result.error.message || 'Unknown error'}`
        });
        return;
      }

      // Move to saving stage
      setGenerationProgress({
        stage: 'saving',
        percent: 90,
        message: 'Finalizing your quiz...'
      });

      // Decrement quiz credits after successful generation
      await decrementCredits('quiz_credits');

      // If successful, reset progress to idle
      setTimeout(() => {
        setGenerationProgress({
          stage: 'idle',
          percent: 0,
          message: ''
        });
      }, 1000);

    } catch (error) {
      console.error("Error in quiz generation:", error);
      setGenerationProgress({
        stage: 'error',
        percent: 100,
        message: 'An error occurred during quiz generation'
      });
    }
  };

  const handleRetry = async () => {
    if (!selectedFile) return;

    // Reset progress and start again
    setGenerationProgress({
      stage: 'analyzing',
      percent: 20,
      message: 'Reanalyzing your content...'
    });

    try {
      const processedFile = await processFile();
      
      if (!processedFile || !processedFile.content) {
        throw new Error("Failed to process file");
      }

      setGenerationProgress({
        stage: 'generating',
        percent: 50,
        message: 'Regenerating quiz questions...'
      });

      const effectiveCourseId = selectedCourseId;
      
      await retrySubmission(
        processedFile.content,
        topics.filter(t => !!t.description),
        difficulty,
        title,
        duration,
        effectiveCourseId
      );

      // If successful, move to saving stage
      setGenerationProgress({
        stage: 'saving',
        percent: 90,
        message: 'Finalizing your quiz...'
      });
      
      // Reset progress to idle
      setTimeout(() => {
        setGenerationProgress({
          stage: 'idle',
          percent: 0,
          message: ''
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error in quiz regeneration:", error);
      setGenerationProgress({
        stage: 'error',
        percent: 100,
        message: 'An error occurred during quiz regeneration'
      });
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
    showUpgradePrompt,
    error,
    handleRetry,
    setTitle,
    handleFileSelect,
    addTopic,
    updateTopic,
    removeTopic,
    handleSubmit,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
    setShowUpgradePrompt,
  };
};
