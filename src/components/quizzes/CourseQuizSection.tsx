
import { Course } from "@/types/course";
import { Quiz } from "@/types/quiz-display";
import { QuizCard } from "./QuizCard";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CourseQuizSectionProps {
  course: Course;
  onViewResults: (quizId: string) => void;
  onStartQuiz: (quizId: string) => void;
  onRetakeQuiz: (quizId: string) => void;
  onQuizDeleted?: () => void;
}

export const CourseQuizSection = ({
  course,
  onViewResults,
  onStartQuiz,
  onRetakeQuiz,
  onQuizDeleted
}: CourseQuizSectionProps) => {
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteQuiz = (quizId: string) => {
    setQuizToDelete(quizId);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    setIsDeleting(true);
    try {
      // Delete the quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizToDelete);
      
      if (error) throw error;
      
      toast({
        title: "Quiz deleted",
        description: "The quiz has been successfully deleted.",
      });
      
      // Refresh quizzes list
      if (onQuizDeleted) {
        onQuizDeleted();
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to delete the quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setQuizToDelete(null);
    }
  };

  const cancelDelete = () => {
    setQuizToDelete(null);
  };

  // Check if there are quizzes for this course
  if (!course.quizzes || course.quizzes.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {course.title}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {course.quizzes.map((quiz: Quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={{
              id: quiz.id,
              title: quiz.title,
              creator: quiz.profiles ? `${quiz.profiles.first_name || ''} ${quiz.profiles.last_name || ''}`.trim() : 'Unknown',
              duration: `${quiz.duration_minutes || 30} minutes`,
              previousScore: quiz.latest_response?.score || 0,
              attemptNumber: quiz.latest_response?.attempt_number || 0,
              totalQuestions: quiz.latest_response?.total_questions || 10,
              status: quiz.latest_response ? 'completed' : 'not_attempted',
              allowRetake: quiz.allow_retakes,
            }}
            onViewResults={onViewResults}
            onStartQuiz={onStartQuiz}
            onRetakeQuiz={onRetakeQuiz}
            onDeleteQuiz={handleDeleteQuiz}
          />
        ))}
      </div>
      
      <AlertDialog open={!!quizToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this quiz and all associated responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteQuiz}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
