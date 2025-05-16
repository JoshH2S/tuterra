
import { useState } from "react";
import { Topic } from "@/types/quiz-generation";

export const useQuizTopicsManagement = () => {
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);

  const addTopic = () => {
    setTopics(prevTopics => [...prevTopics, { description: "", numQuestions: 3 }]);
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
    // Only allow removing if there's more than one topic
    if (topics.length > 1) {
      const newTopics = [...topics];
      newTopics.splice(index, 1);
      setTopics(newTopics);
    }
  };

  return {
    topics,
    addTopic,
    updateTopic,
    removeTopic,
  };
};
