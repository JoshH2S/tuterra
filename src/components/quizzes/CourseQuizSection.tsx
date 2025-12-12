
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quizzes/QuizCard";
import { ProcessedCourse, ProcessedQuiz } from "@/types/quiz-display";

interface CourseQuizSectionProps {
  course: ProcessedCourse;
  onViewResults: (quizId: string) => void;
  onStartQuiz: (quizId: string) => void;
  onRetakeQuiz: (quizId: string) => void;
}

export function CourseQuizSection({ 
  course, 
  onViewResults, 
  onStartQuiz, 
  onRetakeQuiz 
}: CourseQuizSectionProps) {
  const navigate = useNavigate();

  return (
    <section key={course.id} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {course.title || course.id}
        </h2>
        <Button 
          variant="ghost" 
          className="text-sm text-gray-500"
          onClick={() => navigate(`/courses/${course.id}/grades`)}
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {course.quizzes.map((quiz) => (
          <QuizCard 
            key={quiz.id} 
            quiz={quiz}
            onViewResults={onViewResults}
            onStartQuiz={onStartQuiz}
            onRetakeQuiz={onRetakeQuiz}
          />
        ))}
      </div>
    </section>
  );
}
