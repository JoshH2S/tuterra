
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Question, Topic } from "@/types/quiz-generation";
import { QuestionDifficulty } from "@/types/quiz";
import { useNavigate } from "react-router-dom";

export const useQuizSubmission = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const saveQuizToDatabase = async (
    questions: Question[],
    title: string,
    duration: number,
    courseId?: string
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return { success: false, quizId: null };
      }

      // Create the quiz with title, user_id, and duration
      const quizData = {
        title: title || `Quiz - ${new Date().toLocaleDateString()}`,
        user_id: session.user.id,
        duration_minutes: duration
      };

      // Only add course_id if it exists
      if (courseId) {
        Object.assign(quizData, { course_id: courseId });
      }

      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select()
        .single();

      if (quizError) throw quizError;

      // Insert all questions
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

      setQuizId(quiz.id);
      
      return { success: true, quizId: quiz.id };
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
      return { success: false, quizId: null };
    }
  };

  const handleSubmit = async (
    content: string,
    topics: Topic[],
    difficulty: QuestionDifficulty,
    title: string,
    duration: number,
    courseId?: string
  ) => {
    if (!content) {
      return { error: new Error("No content provided") };
    }

    if (topics.some(topic => !topic.description)) {
      return { error: new Error("Please fill out all topics") };
    }

    setIsProcessing(true);
    setQuizQuestions([]);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return { error: new Error("Not authenticated") };
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
            content,
            topics,
            difficulty,
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
      
      // Save the generated quiz to the database
      const saveResult = await saveQuizToDatabase(
        data.quizQuestions,
        title,
        duration,
        courseId
      );

      if (saveResult.success) {
        toast({
          title: "Success",
          description: "Quiz generated and saved successfully!",
        });
      }
      
      return { success: true, quizId: saveResult.quizId };
    } catch (error) {
      console.error('Error processing quiz:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsProcessing(false);
    }
  };

  const retrySubmission = async (
    content: string,
    topics: Topic[],
    difficulty: QuestionDifficulty,
    title: string,
    duration: number,
    courseId?: string
  ) => {
    return handleSubmit(content, topics, difficulty, title, duration, courseId);
  };

  return {
    isProcessing,
    quizQuestions,
    quizId,
    error,
    handleSubmit,
    retrySubmission
  };
};
