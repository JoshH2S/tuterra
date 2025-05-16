
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { shuffleQuestionsOptions } from "@/utils/quiz-helpers";
import { FILE_LIMITS } from "@/utils/file-limits";
import { useQuizFileUpload } from "./useQuizFileUpload";

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
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || "");
  const [difficulty, setDifficulty] = useState<string>("high_school");
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

  // Integrate the improved file upload hook
  const {
    selectedFile,
    contentLength,
    fileError,
    isValidating,
    handleFileSelect: selectFile,
    clearFile
  } = useQuizFileUpload();

  const addTopic = () => {
    setTopics([...topics, { description: "", numQuestions: 3 }]);
  };

  const updateTopic = (index: number, field: keyof Topic, value: string | number) => {
    const newTopics = [...topics];
    newTopics[index] = {
      ...newTopics[index],
      [field]: value
    };
    setTopics(newTopics);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  const saveQuizToDatabase = async (questions: Question[]) => {
    try {
      setGenerationProgress({
        stage: 'saving',
        percentComplete: 90,
        message: 'Saving quiz to your account...'
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const quizData = {
        title: title || `Quiz for ${topics.map(t => t.description).join(", ")}`,
        user_id: session.user.id,
        duration_minutes: duration || Math.max(questions.length, 10), // Default to question count or minimum 10 minutes
        difficulty: difficulty || "high_school"
      };

      if (selectedCourseId) {
        Object.assign(quizData, { course_id: selectedCourseId });
      }

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select()
        .single();

      if (quizError) throw quizError;

      setQuizId(quiz.id);

      const questionsToInsert = questions.map(q => ({
        quiz_id: quiz.id,
        question: q.question,
        correct_answer: q.correctAnswer,
        topic: q.topic,
        points: q.points,
        options: q.options
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      setGenerationProgress({
        stage: 'complete',
        percentComplete: 100,
        message: 'Quiz saved successfully!'
      });

      toast({
        title: "Success",
        description: "Quiz saved successfully!",
      });
    } catch (error) {
      console.error('Error saving quiz:', error);
      setError(new Error('Failed to save quiz. Please try again.'));
      setGenerationProgress({
        stage: 'error',
        percentComplete: 0,
        message: 'Error saving quiz'
      });
      
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
    }
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
    
    setGenerationProgress({
      stage: 'preparing',
      percentComplete: 10,
      message: 'Preparing to generate quiz...'
    });

    try {
      // Read the file content
      const fileContent = await selectedFile.text();
      
      // Safety check on file content length
      if (fileContent.length > FILE_LIMITS.MAX_CHARACTERS) {
        const errorMessage = `File content exceeds maximum length (${FILE_LIMITS.MAX_CHARACTERS.toLocaleString()} characters)`;
        throw new Error(errorMessage);
      }
      
      setGenerationProgress({
        stage: 'analyzing',
        percentComplete: 30,
        message: 'Analyzing your content...'
      });

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

      setGenerationProgress({
        stage: 'generating',
        percentComplete: 50,
        message: 'Generating quiz questions...'
      });

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
      
      setGenerationProgress({
        stage: 'generating',
        percentComplete: 70,
        message: 'Processing quiz questions...'
      });
      
      const shuffledQuestions = shuffleQuestionsOptions(data.quizQuestions);
      setQuizQuestions(shuffledQuestions);
      
      // Save to database
      await saveQuizToDatabase(shuffledQuestions);

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
  };
};
