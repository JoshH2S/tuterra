
import { useState } from "react";
import { QuestionDifficulty } from "@/types/quiz";
import { useParams } from "react-router-dom";

export const useQuizSettings = () => {
  const { id: courseId } = useParams();
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<number>(15);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || "");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("university");

  return {
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
