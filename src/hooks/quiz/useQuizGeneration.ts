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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
      setGenerationProgress({
        stage: 'analyzing',
        percent: 10,
        message: 'Analyzing your content...'
      });

      const fileContent = await selectedFile.text();
      const processedContent = await processContent(fileContent);
      
      setGenerationProgress({
        stage: 'generating',
        percent: 30,
        message: 'Creating quiz questions...'
      });

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
          setGenerationProgress({
            stage: 'saving',
            percent: 85,
            message: 'Finalizing your quiz...'
          });

          await new Promise(resolve => setTimeout(resolve, 1500));

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
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error occurred';
        
        setGenerationProgress({
          stage: 'error',
          percent: 0,
          message: 'Quiz generation failed',
          error: errorMessage
        });
        
        console.error('Quiz generation error:', error);
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

  const handleRetry = () => {
    setGenerationProgress({
      stage: 'idle',
      percent: 0,
      message: ''
    });
    
    toast({
      title: "Ready to retry",
      description: "You can try generating the quiz again.",
    });
  };

  return {
    selectedFile,
    contentLength,
    handleFileSelect,
    
    topics,
    addTopic,
    updateTopic,
    removeTopic,
    
    isProcessing,
    quizQuestions,
    quizId,
    handleSubmit,
    
    title,
    duration,
    selectedCourseId,
    difficulty,
    setTitle,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
    
    generationProgress,
    handleRetry
  };
};
