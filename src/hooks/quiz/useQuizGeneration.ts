
import { useQuizFileUpload } from "./useQuizFileUpload";
import { useQuizTopicsManagement } from "./useQuizTopicsManagement";
import { useQuizSubmission } from "./useQuizSubmission";
import { useQuizSettings } from "./useQuizSettings";
import { useState } from "react";
import { CONTENT_LIMITS } from "@/types/quiz-generation";
import { toast } from "@/components/ui/use-toast";
import { GenerationProgress } from "@/components/quiz-generation/QuizGenerationModal";

export const useQuizGeneration = () => {
  const { 
    selectedFile, 
    contentLength, 
    handleFileSelect 
  } = useQuizFileUpload();
  
  const { 
    topics, 
    addTopic, 
    updateTopic,
    removeTopic
  } = useQuizTopicsManagement();
  
  const { 
    isProcessing, 
    quizQuestions,
    quizId,
    handleSubmit: submitQuizData
  } = useQuizSubmission();
  
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

  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'idle',
    percent: 0,
    message: ''
  });

  const processContent = async (content: string): Promise<string> => {
    // Simulate content processing with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Apply character limit if needed
    if (content.length > CONTENT_LIMITS.MAX_CHARACTERS) {
      return content.slice(0, CONTENT_LIMITS.MAX_CHARACTERS);
    }
    
    return content;
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return { questions: null, quizId: null };
    }

    if (topics.some(topic => !topic.description)) {
      toast({
        title: "Error",
        description: "Please fill out all topics",
        variant: "destructive",
      });
      return { questions: null, quizId: null };
    }

    try {
      // Analysis stage
      setGenerationProgress({
        stage: 'analyzing',
        percent: 10,
        message: 'Analyzing your content...'
      });

      const fileContent = await selectedFile.text();
      const processedContent = await processContent(fileContent);
      
      // Update progress for generation stage
      setGenerationProgress({
        stage: 'generating',
        percent: 30,
        message: 'Creating quiz questions...'
      });

      // Generate questions with periodic progress updates
      const progressUpdater = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev.stage === 'generating' && prev.percent < 70) {
            return {
              ...prev,
              percent: prev.percent + 5,
              message: 'Creating quiz questions...'
            };
          }
          return prev;
        });
      }, 2000);

      // Submit the quiz data
      try {
        const result = await submitQuizData(
          processedContent, 
          topics, 
          difficulty, 
          title, 
          duration, 
          selectedCourseId
        );
        
        clearInterval(progressUpdater);

        if (result.questions) {
          // Saving stage
          setGenerationProgress({
            stage: 'saving',
            percent: 85,
            message: 'Finalizing your quiz...'
          });

          // Simulate saving delay
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Complete
          setGenerationProgress({
            stage: 'idle',
            percent: 100,
            message: 'Quiz generated successfully!'
          });
        } else {
          throw new Error('Failed to generate quiz questions');
        }

        return result;
      } catch (error) {
        clearInterval(progressUpdater);
        
        setGenerationProgress({
          stage: 'error',
          percent: 0,
          message: 'Quiz generation failed',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        
        throw error;
      }
    } catch (error) {
      console.error('Error processing quiz:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
      
      setGenerationProgress({
        stage: 'error',
        percent: 0,
        message: 'Quiz generation failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      return { questions: null, quizId: null };
    }
  };

  return {
    // File handling
    selectedFile,
    contentLength,
    handleFileSelect,
    
    // Topics management
    topics,
    addTopic,
    updateTopic,
    removeTopic,
    
    // Quiz submission
    isProcessing,
    quizQuestions,
    quizId,
    handleSubmit,
    
    // Quiz settings
    title,
    duration,
    selectedCourseId,
    difficulty,
    setTitle,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
    
    // Generation progress
    generationProgress
  };
};
