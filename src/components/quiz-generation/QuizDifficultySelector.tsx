
import { QuestionDifficulty } from "@/types/quiz";

interface QuizDifficultySelectorProps {
  difficulty: QuestionDifficulty;
  setDifficulty: (difficulty: QuestionDifficulty) => void;
}

const DIFFICULTY_OPTIONS: { value: QuestionDifficulty; label: string }[] = [
  { value: "middle_school", label: "Middle School" },
  { value: "high_school", label: "High School" },
  { value: "university", label: "University" },
  { value: "post_graduate", label: "Post Graduate" },
];

export function QuizDifficultySelector({ difficulty, setDifficulty }: QuizDifficultySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-stone-600">Difficulty Level</label>
      <div className="flex flex-wrap gap-2">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setDifficulty(option.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ease-out touch-manipulation ${
              difficulty === option.value
                ? "bg-[#091747] text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:-translate-y-px"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
