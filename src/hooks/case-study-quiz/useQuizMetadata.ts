
import { useState } from "react";
import { QuizMetadata } from "@/types/quiz";

export const useQuizMetadata = () => {
  const [quizMetadata, setQuizMetadata] = useState<QuizMetadata | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  
  return {
    quizMetadata,
    quizId,
    setQuizMetadata,
    setQuizId
  };
};
