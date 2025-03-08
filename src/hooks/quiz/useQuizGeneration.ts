
import { useQuizFileUpload } from "./useQuizFileUpload";
import { useQuizTopicsManagement } from "./useQuizTopicsManagement";
import { useQuizSubmission } from "./useQuizSubmission";
import { useQuizSettings } from "./useQuizSettings";
import { MAX_CONTENT_LENGTH } from "@/types/quiz-generation";

export const useQuizGeneration = () => {
  const { 
    selectedFile, 
    contentLength, 
    handleFileSelect 
  } = useQuizFileUpload();
  
  const { 
    topics, 
    addTopic, 
    updateTopic 
  } = useQuizTopicsManagement();
  
  const { 
    isProcessing, 
    quizQuestions,
    quizId,
    handleSubmit 
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

  const submitQuiz = async () => {
    if (!selectedFile) return { questions: null, quizId: null };
    
    const fileContent = await selectedFile.text();
    return handleSubmit(fileContent, topics, difficulty, title, duration, selectedCourseId);
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
    
    // Quiz submission
    isProcessing,
    quizQuestions,
    quizId,
    handleSubmit: submitQuiz,
    
    // Quiz settings
    title,
    duration,
    selectedCourseId,
    difficulty,
    setTitle,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
  };
};
