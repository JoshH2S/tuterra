
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProcessedQuestion } from "@/types/quiz-results";

interface QuestionReviewCardProps {
  question: ProcessedQuestion;
  userAnswer: string;
  isExpanded?: boolean;
  onToggle: () => void;
}

export function QuestionReviewCard({
  question,
  userAnswer,
  isExpanded = false,
  onToggle
}: QuestionReviewCardProps) {
  const isCorrect = question.isCorrect;
  const correctOptionText = question.options[question.correct_answer] || "";
  const userOptionText = question.options[userAnswer] || "";

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div
        className={cn(
          "border-l-4 transition-colors",
          isCorrect ? "border-green-500" : "border-red-500"
        )}
      >
        {/* Question Header */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-start justify-between"
          onClick={onToggle}
        >
          <div className="space-y-1 flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {question.question}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your answer: {userOptionText}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={isCorrect ? "default" : "destructive"} className="ml-2">
              {isCorrect ? "Correct" : "Incorrect"}
            </Badge>
            <span className="text-gray-400">
              {isExpanded ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-4">
              {/* All Options */}
              <div className="grid gap-2">
                {Object.entries(question.options).map(([key, value]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-lg text-sm flex items-center gap-2",
                      key === question.correct_answer
                        ? "bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300"
                        : key === userAnswer && key !== question.correct_answer
                        ? "bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300"
                        : "bg-gray-50 dark:bg-gray-800"
                    )}
                  >
                    {key === question.correct_answer ? (
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                    ) : key === userAnswer && key !== question.correct_answer ? (
                      <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                    ) : (
                      <span className="w-4 h-4 flex-shrink-0"></span>
                    )}
                    <div>
                      <span className="font-medium mr-1">{key}.</span>
                      <span>{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Explanation: </span>
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
