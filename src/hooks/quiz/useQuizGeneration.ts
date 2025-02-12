import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuizFile } from "./useQuizFile";
import { useQuizTopics } from "./useQuizTopics";
import { Question } from "@/types/quiz";

export const MAX_CONTENT_LENGTH = 5000;

export const useQuizGeneration = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const {
    selectedFile,
    contentLength,
    handleFileSelect,
    processFile,
  } = useQuizFile();

  const {
    topics,
    addTopic,
    updateTopic,
    validateTopics,
  } = useQuizTopics();

  const saveQuizToDatabase = async (questions: Question[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const quizData = {
      title: `Quiz for ${topics.map(t => t.description).join(", ")}`,
      teacher_id: session.user.id,
      duration_minutes: duration,
      course_id: selectedCourseId,
    };

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizData)
      .select()
      .single();

    if (quizError) throw quizError;

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

    return quiz;
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

    if (!validateTopics()) {
      toast({
        title: "Error",
        description: "Please fill out all topics",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setQuizQuestions([]);

    try {
      const processedFile = await processFile();
      if (!processedFile) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: teacherData } = await supabase
        .from('profiles')
        .select('first_name, last_name, school')
        .eq('id', session.user.id)
        .single();

      const response = await fetch(
        'https://nhlsrtubyvggtkyrhkuu.supabase.co/functions/v1/generate-quiz',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            content: processedFile.content,
            topics: topics,
            teacherName: teacherData ? `${teacherData.first_name} ${teacherData.last_name}` : undefined,
            school: teacherData?.school,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuizQuestions(data.quizQuestions);
      
      await saveQuizToDatabase(data.quizQuestions);

      toast({
        title: "Success",
        description: "Quiz generated and saved successfully!",
      });
    } catch (error) {
      console.error('Error processing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    selectedFile,
    topics,
    isProcessing,
    quizQuestions,
    contentLength,
    duration,
    selectedCourseId,
    handleFileSelect,
    addTopic,
    updateTopic,
    handleSubmit,
    setDuration,
    setSelectedCourseId,
  };
};
