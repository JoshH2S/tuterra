
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Topic } from "@/types/quiz-generation";

interface TopicsStepProps {
  topics: Topic[];
  updateTopic: (index: number, field: keyof Topic, value: string | number) => void;
  addTopic: () => void;
}

export const TopicsStep = ({ topics, updateTopic, addTopic }: TopicsStepProps) => {
  const removeTopic = (index: number) => {
    // Only allow removing if there's more than one topic
    if (topics.length > 1) {
      const newTopics = [...topics];
      newTopics.splice(index, 1);
      // We need to update the parent component's state
      // This would need to be implemented in the parent useQuizGeneration hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Quiz Topics</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Define the topics and number of questions for your quiz
        </p>
      </div>

      <div className="space-y-4">
        {topics.map((topic, index) => (
          <TopicCard
            key={index}
            topic={topic}
            index={index}
            updateTopic={updateTopic}
            canRemove={topics.length > 1}
            onRemove={() => removeTopic(index)}
          />
        ))}

        <Button
          variant="outline"
          onClick={addTopic}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
        </Button>
      </div>
    </div>
  );
};

interface TopicCardProps {
  topic: Topic;
  index: number;
  updateTopic: (index: number, field: keyof Topic, value: string | number) => void;
  canRemove: boolean;
  onRemove: () => void;
}

const TopicCard = ({ topic, index, updateTopic, canRemove, onRemove }: TopicCardProps) => {
  return (
    <Card className="relative group">
      <CardContent className="p-6">
        <div className="grid gap-4 md:grid-cols-[1fr,auto] items-end">
          <div className="space-y-2">
            <Label htmlFor={`topic-${index}`}>Topic {index + 1}</Label>
            <Input
              id={`topic-${index}`}
              value={topic.description}
              onChange={(e) => updateTopic(index, "description", e.target.value)}
              placeholder="Enter topic to cover"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`questions-${index}`}>Number of Questions</Label>
            <div className="flex items-center space-x-3">
              <Input
                id={`questions-${index}`}
                type="number"
                min={1}
                max={10}
                value={topic.numQuestions}
                onChange={(e) => updateTopic(index, "numQuestions", parseInt(e.target.value) || 1)}
                className="w-24"
              />
              
              {canRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  className="text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
