
import { Question } from "@/types/quiz";
import { DifficultyBadge } from "./DifficultyBadge";
import { QuestionExplanation } from "./QuestionExplanation";

interface QuizQuestionItemProps {
  question: Question;
  index: number;
}

export const QuizQuestionItem = ({ question, index }: QuizQuestionItemProps) => {
  // Ensure we have valid options object
  const options = question.options || { A: '', B: '', C: '', D: '' };
  
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="font-medium min-w-[20px] text-right">{index + 1}.</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <p className="font-medium flex-1">{question.question || 'No question text'}</p>
            {question.difficulty && (
              <DifficultyBadge difficulty={question.difficulty} />
            )}
          </div>
          <div className="mt-3 space-y-2">
            {Object.entries(options).map(([letter, text]) => (
              <div key={letter} className="flex items-start gap-2 p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <span className="text-sm font-medium min-w-[20px]">{letter}.</span>
                <p className="text-sm">{text || 'No option text'}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3 font-medium">
            Answer: {question.correctAnswer || 'Not specified'}
          </p>
          
          <QuestionExplanation explanation={question.explanation} />
          
          <div className="flex items-center flex-wrap gap-2 mt-3 text-sm text-muted-foreground">
            <span>Topic: {question.topic || 'General'}</span>
            <span className="hidden sm:inline">•</span>
            <span>{question.points || 1} points</span>
          </div>
        </div>
      </div>
    </div>
  );
};
