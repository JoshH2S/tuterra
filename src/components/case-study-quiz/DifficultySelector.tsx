
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioCard } from "@/components/quiz-generation/RadioCard";
import { GraduationCap, School, Brain } from "lucide-react";
import { QuestionDifficulty } from "@/types/quiz";

interface DifficultyOption {
  value: QuestionDifficulty;
  label: string;
  description: string;
}

interface DifficultySelectorProps {
  value: QuestionDifficulty;
  onChange: (value: QuestionDifficulty) => void;
  options: DifficultyOption[];
}

export const DifficultySelector = ({ value, onChange, options }: DifficultySelectorProps) => {
  const getIconForDifficulty = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
      case "middle_school":
      case "high_school":
        return School;
      case "university":
        return GraduationCap;
      case "post_graduate":
        return Brain;
      default:
        return School;
    }
  };

  return (
    <RadioGroup
      value={value}
      onValueChange={(value) => onChange(value as QuestionDifficulty)}
      className="grid gap-3"
    >
      {options.map((option) => (
        <RadioCard
          key={option.value}
          value={option.value}
          icon={getIconForDifficulty(option.value)}
          label={option.label}
          description={option.description}
        />
      ))}
    </RadioGroup>
  );
};
