
import { Question } from "@/types/quiz";
import { Card, CardContent } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizProps {
  questions: Question[];
}

export const Quiz = ({ questions }: QuizProps) => {
  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => (
        <Card key={qIndex} className="overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b">
            <h4 className="font-medium">
              Question {qIndex + 1}: <span className="font-normal">{question.question}</span>
            </h4>
          </div>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Object.entries(question.options).map(([key, value], oIndex) => (
                <div
                  key={oIndex}
                  className={cn(
                    "p-3 rounded-md border flex items-start gap-3",
                    key === question.correctAnswer
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
                      : "bg-white dark:bg-gray-950"
                  )}
                >
                  <div className="mt-0.5">
                    {key === question.correctAnswer ? (
                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xs">{key}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm">{value}</div>
                </div>
              ))}
            </div>
            
            {question.explanation && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Explanation: </span>
                    {question.explanation}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
