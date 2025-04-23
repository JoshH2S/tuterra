
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Clock, FileText, MoreVertical, User, BookMarked, Play, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    creator: string;
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
  onDeleteQuiz?: (quizId: string) => void;
}

// Define interface for quiz progress
interface QuizProgress {
  id?: string;
  quiz_id: string;
  student_id: string;
  current_question_index: number;
  selected_answers: Record<number, string>;
  time_remaining: number | null;
}

export function QuizCard({ 
  quiz, 
  onViewResults, 
  onStartQuiz, 
  onRetakeQuiz, 
  onDeleteQuiz 
}: QuizCardProps) {
  // Only show score if there's a valid attempt
  const hasAttempted = quiz.status === 'completed' && quiz.attemptNumber > 0;
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Ensure the score is a valid percentage between 0-100
  const normalizedScore = hasAttempted ? Math.min(Math.max(0, quiz.previousScore), 100) : 0;
  
  // Check if the user has saved progress for this quiz
  useEffect(() => {
    const checkSavedProgress = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) return;
      
      const { data: progressData } = await supabase
        .from('quiz_progress')
        .select('id')
        .eq('quiz_id', quiz.id)
        .eq('student_id', userId)
        .maybeSingle() as { data: { id: string } | null, error: any };
        
      setHasSavedProgress(!!progressData);
    };
    
    checkSavedProgress();
  }, [quiz.id]);

  const handleDeleteClick = () => {
    if (onDeleteQuiz) {
      onDeleteQuiz(quiz.id);
    }
  };
  
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
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <MoreVertical className="w-4 h-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className="flex items-center py-2 px-3 cursor-pointer touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 rounded-md transition-colors text-red-600 dark:text-red-400"
                onClick={handleDeleteClick}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Quiz
              </DropdownMenuItem>
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
            Creator: {quiz.creator}
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

        {/* Previous Score - only show if there's a valid attempt */}
        {hasAttempted && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Latest Score (Attempt #{quiz.attemptNumber})
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {normalizedScore}%
              </span>
            </div>
            <Progress 
              value={normalizedScore} 
              className="h-2 bg-gray-100 dark:bg-gray-700"
              indicatorClassName="bg-primary"
            />
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
              {hasSavedProgress ? (
                <>
                  <BookMarked className="w-4 h-4 mr-2" />
                  Resume Quiz
                </>
              ) : quiz.status === 'in_progress' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Continue Quiz
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
