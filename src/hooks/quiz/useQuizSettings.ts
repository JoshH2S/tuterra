
import { useState } from "react";
import { QuestionDifficulty } from "@/types/quiz";
import { useParams } from "react-router-dom";

export const useQuizSettings = () => {
  const { id: courseId } = useParams();
  const [duration, setDuration] = useState<number>(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || "");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("high_school");

  return {
    duration,
    selectedCourseId,
    difficulty,
    setDuration,
    setSelectedCourseId,
    setDifficulty,
  };
};
