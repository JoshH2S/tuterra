
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuizTitleInputProps {
  title: string;
  onChange: (title: string) => void;
}

export function QuizTitleInput({ title, onChange }: QuizTitleInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="quiz-title" className="text-sm font-medium text-stone-600">Quiz Title</Label>
      <Input
        id="quiz-title"
        placeholder="Enter a title for your quiz"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-stone-50 border-stone-200 focus-visible:ring-stone-300"
      />
      <p className="text-xs text-stone-400">This title will appear in the quizzes section</p>
    </div>
  );
}
