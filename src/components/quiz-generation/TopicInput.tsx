import { Input } from "@/components/ui/input";

interface Topic {
  name: string;
  questionCount: number;
}

interface TopicInputProps {
  topic: Topic;
  index: number;
  onChange: (index: number, field: keyof Topic, value: string | number) => void;
}

export const TopicInput = ({ topic, index, onChange }: TopicInputProps) => {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <Input
          placeholder="Enter topic"
          value={topic.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
        />
      </div>
      <div className="w-32">
        <Input
          type="number"
          min="1"
          value={topic.questionCount}
          onChange={(e) => onChange(index, "questionCount", e.target.value)}
        />
      </div>
    </div>
  );
};