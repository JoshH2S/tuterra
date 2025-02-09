
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuizDurationInputProps {
  duration: number;
  onChange: (duration: number) => void;
}

export const QuizDurationInput = ({ duration, onChange }: QuizDurationInputProps) => {
  return (
    <div className="mb-6">
      <Label htmlFor="duration">Quiz Duration (minutes)</Label>
      <Input
        id="duration"
        type="number"
        min="0"
        value={duration}
        onChange={(e) => onChange(Number(e.target.value))}
        className="max-w-[200px]"
      />
      <p className="text-sm text-muted-foreground mt-1">
        Set to 0 for no time limit
      </p>
    </div>
  );
};
