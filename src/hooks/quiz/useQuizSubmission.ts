
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { shuffleQuestionsOptions } from "@/utils/quiz-helpers";
import { FILE_LIMITS } from "@/utils/file-limits";
import { Question } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";
import { useQuizGenerationProgress } from "./useQuizGenerationProgress";
import { useQuizSave } from "./useQuizSave";

interface QuizSubmissionProps {
  selectedFile: File | null;
  topics: { description: string; numQuestions: number }[];
  title: string;
  duration: number;
  selectedCourseId?: string;
  difficulty: QuestionDifficulty;
}

export const useQuizSubmission = () => {
  const navigate = useNavigate();
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  
  const { 
    isProcessing, 
    setIsProcessing,
    error, 
    setError, 
    setPreparingStage, 
    setAnalyzingStage, 
    setGeneratingStage,
    setSavingStage,
    setCompleteStage,
    setErrorStage,
    resetProgress
  } = useQuizGenerationProgress();
  
  const { saveQuizToDatabase } = useQuizSave();

  const handleSubmit = async ({
    selectedFile,
    topics,
    title,
    duration,
    selectedCourseId,
    difficulty
  }: QuizSubmissionProps) => {
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
    resetProgress();
    setPreparingStage();

    try {
      // Read the file content
      const fileContent = await selectedFile.text();
      
      // Safety check on file content length
      if (fileContent.length > FILE_LIMITS.MAX_CHARACTERS) {
        const errorMessage = `File content exceeds maximum length (${FILE_LIMITS.MAX_CHARACTERS.toLocaleString()} characters)`;
        throw new Error(errorMessage);
      }
      
      setAnalyzingStage();

      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get teacher profile information
      const { data: teacherData } = await supabase
        .from('profiles')
        .select('first_name, last_name, school')
        .eq('id', session.user.id)
        .single();

      setGeneratingStage(50);

      // Call the quiz generation function
      const response = await fetch(
        'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-quiz',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            content: fileContent.slice(0, FILE_LIMITS.MAX_CHARACTERS), // Safety trim
            topics: topics,
            teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : undefined,
            school: teacherData?.school,
            difficulty: difficulty
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      
      setGeneratingStage(70);
      
      const shuffledQuestions = shuffleQuestionsOptions(data.quizQuestions);
      setQuizQuestions(shuffledQuestions);
      
      setSavingStage();
      
      // Save to database
      const result = await saveQuizToDatabase(
        shuffledQuestions, 
        title || `Quiz for ${topics.map(t => t.description).join(", ")}`,
        duration || Math.max(shuffledQuestions.length, 10),
        selectedCourseId
      );
      
      if (result.success) {
        setQuizId(result.quizId);
        setCompleteStage();
      } else {
        throw new Error('Failed to save quiz');
      }

    } catch (error) {
      console.error('Error processing quiz:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      setErrorStage('Error generating quiz');
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = (props: QuizSubmissionProps) => {
    setError(null);
    handleSubmit(props);
  };

  return {
    quizQuestions,
    quizId,
    isProcessing,
    error,
    handleSubmit,
    handleRetry
  };
};
