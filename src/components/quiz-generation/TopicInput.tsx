
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award } from "lucide-react";

interface Topic {
  description: string;
  points: number;
}

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
        <Label>Points per Question</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            max="3"
            value={topic.points}
            onChange={(e) => onChange(index, "points", parseInt(e.target.value))}
            className="w-24"
          />
          <Award className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};
