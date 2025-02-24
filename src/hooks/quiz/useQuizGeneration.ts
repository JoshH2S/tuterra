import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { QuestionDifficulty } from "@/types/quiz";
import { Topic, Question, MAX_CONTENT_LENGTH } from "@/types/quiz-generation";
import { useQuizSave } from "./useQuizSave";
import { useQuizAPI } from "./useQuizAPI";

export const useQuizGeneration = () => {
  const navigate = useNavigate();
  const { id: courseId } = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [contentLength, setContentLength] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || "");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("high_school");

  const { saveQuizToDatabase } = useQuizSave();
  const { generateQuiz } = useQuizAPI();

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
      
      const generatedQuestions = await generateQuiz(trimmedContent, topics, difficulty);
      setQuizQuestions(generatedQuestions);
      
      // Save the generated quiz to the database
      await saveQuizToDatabase(generatedQuestions, topics, duration, courseId);

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
    difficulty,
    handleFileSelect,
    addTopic,
    updateTopic,
    handleSubmit,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
  };
};
