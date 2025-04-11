
import { useMemo } from "react";
import { QuizCard } from "./QuizCard";

interface CourseQuizSectionProps {
  courseTitle: string;
  quizzes: {
    id: string;
    title: string;
    creator: string;
    duration: string;
    previousScore: number;
    attemptNumber: number;
    totalQuestions: number;
    status: 'not_attempted' | 'in_progress' | 'completed';
    allowRetake?: boolean;
  }[];
  onViewResults: (quizId: string) => void;
  onStartQuiz: (quizId: string) => void;
  onRetakeQuiz: (quizId: string) => void;
  hasQuizProgress: (quizId: string) => boolean;
}

export function CourseQuizSection({
  courseTitle,
  quizzes = [], // Provide default empty array
  onViewResults,
  onStartQuiz,
  onRetakeQuiz,
  hasQuizProgress
}: CourseQuizSectionProps) {
  
  // Sort quizzes by status: completed > in_progress > not_attempted
  const sortedQuizzes = useMemo(() => {
    if (!quizzes || !Array.isArray(quizzes)) return [];
    
    const statusOrder = {
      'in_progress': 1,
      'completed': 2,
      'not_attempted': 3
    };
    
    return [...quizzes].sort((a, b) => {
      const aStatus = a.status;
      const bStatus = b.status;
      
      return statusOrder[aStatus] - statusOrder[bStatus];
    });
  }, [quizzes]);
  
  return (
    <div className="my-8">
      <h2 className="text-xl font-semibold mb-4">{courseTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedQuizzes.map(quiz => {
          // Update quiz status to in_progress if there's saved progress
          const updatedQuiz = {
            ...quiz,
            status: hasQuizProgress(quiz.id) && quiz.status !== 'completed' ? 'in_progress' : quiz.status
          };
          
          return (
            <QuizCard
              key={quiz.id}
              quiz={updatedQuiz}
              onViewResults={onViewResults}
              onStartQuiz={onStartQuiz}
              onRetakeQuiz={onRetakeQuiz}
            />
          );
        })}
      </div>
    </div>
  );
}
