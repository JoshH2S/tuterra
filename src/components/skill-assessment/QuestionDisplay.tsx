import { ReactNode } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

interface Question {
  question: string;
  type: string;
  options: Record<string, string>;
  correctAnswer: string | string[];
  skill?: string;
}

interface QuestionDisplayProps {
  question: Question;
  currentAnswer: string | string[] | undefined;
  onAnswerChange: (value: string | string[]) => void;
}

export const QuestionDisplay = ({
  question,
  currentAnswer,
  onAnswerChange,
}: QuestionDisplayProps) => {
  const isMultiAnswer = question.type === "multiple_answer";

  return (
    <div className="px-6 py-6">
      {question.skill && (
        <motion.span
          className="inline-flex items-center text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {question.skill}
        </motion.span>
      )}

      <p className="text-lg font-normal leading-relaxed text-gray-900 mb-6">
        {question.question}
      </p>

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        {isMultiAnswer
          ? Array.isArray(question.correctAnswer) && question.correctAnswer.length > 0
            ? `Select ${question.correctAnswer.length} answers`
            : "Select all that apply"
          : "Select the best answer"}
      </p>

      {renderOptions(question, currentAnswer, onAnswerChange)}
    </div>
  );
};

function renderOptions(
  question: Question,
  currentAnswer: string | string[] | undefined,
  onAnswerChange: (value: string | string[]) => void
): ReactNode {
  if (question.type === "multiple_choice") {
    return (
      <RadioGroup
        value={(currentAnswer as string) || ""}
        onValueChange={onAnswerChange}
        className="space-y-2"
      >
        {Object.entries(question.options).map(([key, value], index) => {
          const isSelected = currentAnswer === key;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: index * 0.04 }}
            >
              <label
                htmlFor={`option-${key}`}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? "border-[#C8A84B] bg-amber-50/70 text-gray-900"
                    : "border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700"
                }`}
              >
                <RadioGroupItem value={key} id={`option-${key}`} className="shrink-0" />
                <span className="text-sm leading-snug">{value}</span>
              </label>
            </motion.div>
          );
        })}
      </RadioGroup>
    );
  }

  if (question.type === "multiple_answer") {
    const currentAnswers = (currentAnswer as string[]) || [];
    return (
      <div className="space-y-2">
        {Object.entries(question.options).map(([key, value], index) => {
          const isChecked = currentAnswers.includes(key);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: index * 0.04 }}
            >
              <label
                htmlFor={`option-${key}`}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
                  isChecked
                    ? "border-[#C8A84B] bg-amber-50/70 text-gray-900"
                    : "border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700"
                }`}
              >
                <Checkbox
                  id={`option-${key}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onAnswerChange([...currentAnswers, key]);
                    } else {
                      onAnswerChange(currentAnswers.filter((item) => item !== key));
                    }
                  }}
                  className="shrink-0"
                />
                <span className="text-sm leading-snug">{value}</span>
              </label>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-center py-6 text-sm text-gray-400">
      Question type not supported
    </div>
  );
}
