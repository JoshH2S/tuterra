
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export const MAX_CONTENT_LENGTH = 5000;

export const useQuizGeneration = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [contentLength, setContentLength] = useState<number>(0);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const content = await file.text();
    setContentLength(content.length);
  };

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

  const saveQuizToDatabase = async (questions: Question[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Create the quiz with title and teacher_id
      const quizData = {
        title: `Quiz for ${topics.map(t => t.description).join(", ")}`,
        teacher_id: session.user.id,
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

      toast({
        title: "Success",
        description: "Quiz saved successfully!",
      });
    } catch (error) {
      console.error('Error saving quiz:', error);
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

    try {
      const fileContent = await selectedFile.text();
      const trimmedContent = fileContent.slice(0, MAX_CONTENT_LENGTH);
      
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
            content: trimmedContent,
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
      
      // Save the generated quiz to the database
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
    handleFileSelect,
    addTopic,
    updateTopic,
    handleSubmit,
  };
};
