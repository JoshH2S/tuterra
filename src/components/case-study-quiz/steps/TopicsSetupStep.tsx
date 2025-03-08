
import { StepHeader } from "@/components/quiz-generation/StepHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { Topic } from "@/types/quiz";

interface TopicsSetupStepProps {
  topics: Topic[];
  setTopics: (topics: Topic[]) => void;
}

export const TopicsSetupStep = ({ topics, setTopics }: TopicsSetupStepProps) => {
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
    if (topics.length === 1) return;
    const newTopics = [...topics];
    newTopics.splice(index, 1);
    setTopics(newTopics);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        title="Topic Selection"
        description="Define the topics and number of questions for your case study"
        icon={ListChecks}
      />

      <div className="space-y-4">
        {topics.map((topic, index) => (
          <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-0">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Topic {index + 1}</h3>
                  {topics.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeTopic(index)}
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic Description</label>
                  <Input
                    value={topic.description}
                    onChange={(e) => updateTopic(index, "description", e.target.value)}
                    placeholder="Enter a topic to cover"
                    className="w-full"
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
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={addTopic}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Topic
        </Button>
      </div>
    </div>
  );
};
