
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
import { Clock, FileText, MoreVertical, User, BookMarked, Play } from "lucide-react";
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

export function QuizCard({ quiz, onViewResults, onStartQuiz, onRetakeQuiz }: QuizCardProps) {
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
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl bg-white border border-black/[0.06] shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_4px_16px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-all duration-300"
    >
      <div className="p-6">
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-5">
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-600 border-gray-200"
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 line-clamp-2 leading-relaxed">
          {quiz.title}
        </h3>

        {/* Quiz Details */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <User className="w-3.5 h-3.5 mr-2" />
            Creator: {quiz.creator}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 mr-2" />
            Duration: {quiz.duration}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <FileText className="w-3.5 h-3.5 mr-2" />
            {quiz.totalQuestions} Questions
          </div>
        </div>

        {/* Previous Score - only show if there's a valid attempt */}
        {hasAttempted && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Latest Score (Attempt #{quiz.attemptNumber})
              </span>
              <span className="text-xs font-medium text-gray-700 dark:text-white">
                {normalizedScore}%
              </span>
            </div>
            <Progress 
              value={normalizedScore} 
              className="h-1.5 bg-black/5"
              indicatorClassName="bg-[#B8860B]"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5">
          {quiz.status === 'completed' ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1 rounded-full" 
                onClick={() => onViewResults(quiz.id)}
              >
                View Results
              </Button>
              {quiz.allowRetake && (
                <Button 
                  className="flex-1 rounded-full text-black bg-gradient-to-br from-[#FFF8DC]/90 to-[#FFE4B5]/90 border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_25px_rgba(184,134,11,0.18)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(184,134,11,0.26)] transition-all"
                  onClick={() => onRetakeQuiz(quiz.id)}
                >
                  Retake Quiz
                </Button>
              )}
            </>
          ) : (
            <Button 
              className="w-full rounded-full text-black bg-gradient-to-br from-[#FFF8DC]/90 to-[#FFE4B5]/90 border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_25px_rgba(184,134,11,0.18)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(184,134,11,0.26)] transition-all"
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
