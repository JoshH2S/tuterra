
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/label";

interface QuizTitleInputProps {
  title: string;
  onChange: (title: string) => void;
}

export function QuizTitleInput({ title, onChange }: QuizTitleInputProps) {
  return (
    <div className="space-y-2">
      <FormLabel htmlFor="quiz-title">Quiz Title</FormLabel>
      <Input
        id="quiz-title"
        placeholder="Enter a title for your quiz"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
      <p className="text-sm text-muted-foreground">
        This title will appear in the quizzes section
      </p>
    </div>
  );
}
