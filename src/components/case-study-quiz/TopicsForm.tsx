
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Topic } from "@/types/quiz";

interface TopicsFormProps {
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
}

export const TopicsForm = ({ topics, setTopics }: TopicsFormProps) => {
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

  return (
    <>
      {topics.map((topic, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic {index + 1}</label>
            <Input
              value={topic.description}
              onChange={(e) => updateTopic(index, "description", e.target.value)}
              placeholder="Enter topic to cover"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Questions</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={topic.numQuestions}
              onChange={(e) => updateTopic(index, "numQuestions", parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addTopic}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Topic
      </Button>
    </>
  );
};
