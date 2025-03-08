
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuestionDifficulty } from "@/types/quiz";

interface QuizDifficultySelectorProps {
  difficulty: QuestionDifficulty;
  setDifficulty: (difficulty: QuestionDifficulty) => void;
}

export function QuizDifficultySelector({ difficulty, setDifficulty }: QuizDifficultySelectorProps) {
  const difficultyOptions: { value: QuestionDifficulty; label: string }[] = [
    { value: "middle_school", label: "Middle School" },
    { value: "high_school", label: "High School" },
    { value: "university", label: "University" },
    { value: "post_graduate", label: "Post Graduate" },
  ];

  return (
    <div className="space-y-3">
      <Label>Difficulty Level</Label>
      <RadioGroup
        value={difficulty}
        onValueChange={(value) => setDifficulty(value as QuestionDifficulty)}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {difficultyOptions.map((option) => (
          <div
            key={option.value}
            className={`
              flex items-center space-x-2 rounded-md border p-3 cursor-pointer
              ${difficulty === option.value ? "border-primary bg-primary/5" : ""}
            `}
            onClick={() => setDifficulty(option.value)}
          >
            <RadioGroupItem value={option.value} id={option.value} />
            <Label
              htmlFor={option.value}
              className="cursor-pointer font-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
