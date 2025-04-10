
import { useState } from "react";
import { Topic } from "@/types/quiz-generation";

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

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      const newTopics = [...topics];
      newTopics.splice(index, 1);
      setTopics(newTopics);
    }
  };

  return {
    topics,
    setTopics,
    addTopic,
    updateTopic,
    removeTopic
  };
};
