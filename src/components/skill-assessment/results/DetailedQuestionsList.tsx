
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionResult {
  question: string;
  correct: boolean;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  skill?: string;
}

interface DetailedQuestionsListProps {
  questions: QuestionResult[];
}

export const DetailedQuestionsList = ({ questions }: DetailedQuestionsListProps) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No question details available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((item, index) => (
        <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
          <div className="flex items-start gap-2">
            {item.correct ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{item.question}</p>
              <div className="mt-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Your answer: </span>
                  <span className={item.correct ? "text-green-600" : "text-red-600"}>
                    {Array.isArray(item.userAnswer) 
                      ? item.userAnswer.join(", ") 
                      : item.userAnswer || "No answer"}
                  </span>
                </p>
                {!item.correct && (
                  <p className="mt-1">
                    <span className="text-muted-foreground">Correct answer: </span>
                    <span className="text-green-600">
                      {Array.isArray(item.correctAnswer) 
                        ? item.correctAnswer.join(", ") 
                        : item.correctAnswer}
                    </span>
                  </p>
                )}
              </div>
              {item.skill && (
                <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {item.skill}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
