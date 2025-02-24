
import { Label } from "@/components/ui/label";
import { DIFFICULTY_COLORS, Question, QuestionDifficulty } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";

interface QuizQuestionItemProps {
  question: Question;
  index: number;
}

export const QuizQuestionItem = ({ question, index }: QuizQuestionItemProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="font-medium">{index + 1}.</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-medium">{question.question}</p>
            <Badge 
              variant="secondary" 
              className={`${DIFFICULTY_COLORS[question.difficulty]} capitalize ml-2`}
            >
              {question.difficulty}
            </Badge>
          </div>
          <div className="mt-2 space-y-1">
            {Object.entries(question.options).map(([letter, text]) => (
              <div key={letter} className="flex items-start gap-2">
                <span className="text-sm font-medium min-w-[20px]">{letter}.</span>
                <p className="text-sm">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Answer: {question.correctAnswer}
          </p>
          {question.explanation && (
            <p className="text-sm text-muted-foreground mt-1">
              Explanation: {question.explanation}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>Topic: {question.topic}</span>
            <span>•</span>
            <span>{question.points} points</span>
          </div>
        </div>
      </div>
    </div>
  );
};
