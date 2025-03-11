
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuizTitleInputProps {
  title: string;
  onChange: (title: string) => void;
}

export function QuizTitleInput({ title, onChange }: QuizTitleInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="quiz-title">Quiz Title</Label>
      <Input
        id="quiz-title"
        placeholder="Enter a title for your quiz"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
}
