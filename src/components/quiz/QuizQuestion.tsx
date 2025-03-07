
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionDifficulty } from "@/hooks/quiz/quizTypes";
import { QuizTimer } from "./QuizTimer";
import { QuizProgress } from "./QuizProgress";
import { QuestionDot } from "./QuestionDot";

interface QuizQuestionProps {
  question: {
    id: string;
    question: string;
    options: Record<string, string>;
    correct_answer: string;
    topic: string;
    difficulty: QuestionDifficulty;
  };
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number | null;
  selectedAnswer: string | undefined;
  answeredQuestions: number[];
  onAnswerSelect: (answer: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const DIFFICULTY_COLORS = {
  'beginner': 'bg-green-100 text-green-800',
  'intermediate': 'bg-blue-100 text-blue-800',
  'advanced': 'bg-purple-100 text-purple-800',
  'expert': 'bg-red-100 text-red-800',
};

export function QuizQuestion({
  question,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  selectedAnswer,
  answeredQuestions,
  onAnswerSelect,
  onNext,
  onPrevious
}: QuizQuestionProps) {
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;
  
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Floating Progress Header */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-10">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <QuizTimer timeRemaining={timeRemaining} />
            <QuizProgress current={currentQuestion + 1} total={totalQuestions} />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center p-6 mt-16">
        <div className="w-full max-w-3xl space-y-8">
          {/* Topic & Difficulty */}
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary">
              {question.topic}
            </Badge>
            <Badge className={DIFFICULTY_COLORS[question.difficulty]}>
              {question.difficulty.replace(/^\w/, c => c.toUpperCase())} Level
            </Badge>
          </div>

          {/* Question Text */}
          <h2 className="text-2xl font-medium text-gray-900 dark:text-white leading-relaxed">
            {question.question}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(question.options).map(([key, value]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAnswerSelect(key)}
                className={cn(
                  "relative p-6 rounded-xl border-2 text-left transition-all",
                  "hover:border-primary hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  selectedAnswer === key ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium",
                    selectedAnswer === key ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    {key}
                  </div>
                  <span className="text-lg">{value}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={onPrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {/* Question Numbers */}
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <QuestionDot 
                key={index}
                isActive={currentQuestion === index}
                isAnswered={answeredQuestions.includes(index)}
              />
            ))}
          </div>

          <Button 
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={onNext}
            disabled={currentQuestion === totalQuestions - 1 && !selectedAnswer}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
