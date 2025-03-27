import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Topic, Question, CONTENT_LIMITS } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";
import { useQuizSubmission } from "./useQuizSubmission";
import { useQuizFileUpload } from "./useQuizFileUpload";

export interface GenerationProgress {
  stage: 'idle' | 'analyzing' | 'generating' | 'saving' | 'error';
  percent: number;
  message: string;
}

export const useQuizGeneration = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [title, setTitle] = useState<string>("");
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);
  const [duration, setDuration] = useState<number>(15);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || "");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("university");
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'idle',
    percent: 0,
    message: ''
  });
  
  const { 
    selectedFile, 
    contentLength, 
    handleFileSelect, 
    processFile 
  } = useQuizFileUpload();
  
  const {
    isProcessing,
    quizQuestions,
    quizId,
    error,
    handleSubmit: submitQuiz,
    retrySubmission
  } = useQuizSubmission();

  const addTopic = () => {
    setTopics([...topics, { description: "", numQuestions: 3 }]);
  };

  const updateTopic = (index: number, field: keyof Topic, value: string | number) => {
    const newTopics = [...topics];
    newTopics[index] = {
      ...newTopics[index],
      [field]: field === 'numQuestions' ? Number(value) : value
    };
    setTopics(newTopics);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      const newTopics = [...topics];
      newTopics.splice(index, 1);
      setTopics(newTopics);
    } else {
      toast({
        title: "Cannot remove",
        description: "You need at least one topic",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
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

      const effectiveCourseId = selectedCourseId || courseId;
      
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
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quiz",
        variant: "destructive",
      });
    }
  };

  const handleRetry = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "File is missing. Please select a file again.",
        variant: "destructive",
      });
      return;
    }

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

      const effectiveCourseId = selectedCourseId || courseId;
      
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
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to regenerate quiz",
        variant: "destructive",
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
  };
};
