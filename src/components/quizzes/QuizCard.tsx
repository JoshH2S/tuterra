
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Clock, FileText, MoreVertical, User } from "lucide-react";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    creator: string; // Changed from teacher
    duration: string;
    previousScore: number;
    attemptNumber: number;
    totalQuestions: number;
    status: 'not_attempted' | 'in_progress' | 'completed';
    allowRetake?: boolean;
  }
  onViewResults: (quizId: string) => void;
  onStartQuiz: (quizId: string) => void;
  onRetakeQuiz: (quizId: string) => void;
}

export function QuizCard({ quiz, onViewResults, onStartQuiz, onRetakeQuiz }: QuizCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-4">
          <Badge
            variant={
              quiz.status === 'completed' ? 'default' :
              quiz.status === 'in_progress' ? 'secondary' : 'outline'
            }
          >
            {quiz.status === 'not_attempted' ? 'Not Attempted' :
             quiz.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit Quiz</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quiz Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {quiz.title}
        </h3>

        {/* Quiz Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4 mr-2" />
            Creator: {quiz.creator} {/* Changed from Teacher */}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            Duration: {quiz.duration}
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FileText className="w-4 h-4 mr-2" />
            {quiz.totalQuestions} Questions
          </div>
        </div>

        {/* Previous Score */}
        {quiz.previousScore > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Previous Score
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {quiz.previousScore}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${quiz.previousScore}%` }}
                className="h-full bg-primary"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Attempt #{quiz.attemptNumber}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {quiz.status === 'completed' ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => onViewResults(quiz.id)}
              >
                View Results
              </Button>
              {quiz.allowRetake && (
                <Button 
                  className="flex-1"
                  onClick={() => onRetakeQuiz(quiz.id)}
                >
                  Retake Quiz
                </Button>
              )}
            </>
          ) : (
            <Button 
              className="w-full"
              onClick={() => onStartQuiz(quiz.id)}
            >
              {quiz.status === 'in_progress' ? 'Continue Quiz' : 'Start Quiz'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
