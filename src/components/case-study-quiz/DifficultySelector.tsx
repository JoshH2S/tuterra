
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
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ease-out touch-manipulation ${
            value === option.value
              ? "bg-[#091747] text-white shadow-sm"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:-translate-y-px"
          }`}
        >
          {option.label}
        </button>
      ))}
      {value && (
        <p className="w-full text-xs text-stone-400 mt-1 leading-relaxed">
          {options.find((o) => o.value === value)?.description}
        </p>
      )}
    </div>
  );
};
