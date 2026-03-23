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
  questionIndex: number;
  totalQuestions: number;
  currentAnswer: string | string[] | undefined;
  onAnswerChange: (value: string | string[]) => void;
  progress: number;
}

export const QuestionDisplay = ({
  question,
  questionIndex,
  totalQuestions,
  currentAnswer,
  onAnswerChange,
  progress,
}: QuestionDisplayProps) => {
  const isMultiAnswer = question.type === "multiple_answer";
  const hint = isMultiAnswer
    ? Array.isArray(question.correctAnswer) && question.correctAnswer.length > 0
      ? `Select ${question.correctAnswer.length} answers`
      : "Select all that apply"
    : "Select the best answer";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">
      {/* Card header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-400">
              Question {questionIndex + 1} of {totalQuestions}
            </p>
            {question.skill && (
              <motion.span
                className="text-xs font-medium bg-[#091747]/8 text-[#091747] px-2.5 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {question.skill}
              </motion.span>
            )}
          </div>
          <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
        </div>
        {/* Amber progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#C8A84B] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question text */}
      <div className="px-6 py-6">
        <motion.p
          className="text-xl font-normal leading-relaxed text-gray-900"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {question.question}
        </motion.p>
        <p className="mt-2 text-xs text-gray-400">{hint}</p>
      </div>

      {/* Answer options */}
      <div className="px-6 pb-6">
        {renderOptions(question, currentAnswer, onAnswerChange)}
      </div>
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
        className="space-y-2.5"
      >
        {Object.entries(question.options).map(([key, value], index) => {
          const isSelected = currentAnswer === key;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <label
                htmlFor={`option-${key}`}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all select-none ${
                  isSelected
                    ? "border-[#091747] bg-[#091747]/5"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/60"
                }`}
              >
                <RadioGroupItem value={key} id={`option-${key}`} className="shrink-0" />
                <span className="text-sm text-gray-800 leading-snug">{value}</span>
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
      <div className="space-y-2.5">
        {Object.entries(question.options).map(([key, value], index) => {
          const isChecked = currentAnswers.includes(key);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
            >
              <label
                htmlFor={`option-${key}`}
                className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all select-none ${
                  isChecked
                    ? "border-[#091747] bg-[#091747]/5"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/60"
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
                  className="mt-0.5 shrink-0"
                />
                <span className="text-sm text-gray-800 leading-snug">{value}</span>
              </label>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="text-center py-4 text-sm text-gray-400">
      Question type not supported
    </div>
  );
}
