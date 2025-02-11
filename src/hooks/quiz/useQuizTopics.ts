
import { useState } from "react";
import { Topic } from "@/hooks/useQuizGeneration";

export const useQuizTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([{ description: "", numQuestions: 3 }]);

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

  const validateTopics = () => {
    return !topics.some(topic => !topic.description);
  };

  return {
    topics,
    addTopic,
    updateTopic,
    validateTopics,
  };
};
