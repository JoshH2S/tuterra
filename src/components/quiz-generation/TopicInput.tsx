
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HashIcon } from "lucide-react";
import { Topic } from "@/hooks/useQuizGeneration";

interface TopicInputProps {
  topic: Topic;
  index: number;
  onChange: (index: number, field: keyof Topic, value: string | number) => void;
}

export const TopicInput = ({ topic, index, onChange }: TopicInputProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Topic {index + 1}</Label>
        <Input
          placeholder="Enter topic to cover"
          value={topic.description}
          onChange={(e) => onChange(index, "description", e.target.value)}
        />
      </div>
      <div>
        <Label>Number of Questions</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            max="10"
            value={topic.numQuestions}
            onChange={(e) => onChange(index, "numQuestions", parseInt(e.target.value))}
            className="w-24"
          />
          <HashIcon className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};
