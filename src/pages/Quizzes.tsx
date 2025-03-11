
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCourses } from "@/hooks/useCourses";
import { QuizFilters } from "@/components/quizzes/QuizFilters";
import { CourseQuizSection } from "@/components/quizzes/CourseQuizSection";
import { QuizzesEmptyState } from "@/components/quizzes/QuizzesEmptyState";
import { RetakeConfirmDialog } from "@/components/quiz-taking/RetakeConfirmDialog";
import { Quiz, QuizzesByCourse, ProcessedCourse, ProcessedQuiz } from "@/types/quiz-display";
import { Plus } from "lucide-react";
import { QuizDisclaimer } from "@/components/quiz-generation/QuizDisclaimer";

export default function Quizzes() {
  const [quizzesByCourse, setQuizzesByCourse] = useState<QuizzesByCourse>({});
  const [processedCourses, setProcessedCourses] = useState<ProcessedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmRetakeQuiz, setConfirmRetakeQuiz] = useState<Quiz | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();
  const { courses } = useCourses();
  const isMobile = useIsMobile();

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          ),
          quiz_responses!quiz_responses_quiz_id_fkey (
            id,
            score,
            total_questions,
            attempt_number
          )
        `)
        .eq('published', true);

      if (error) throw error;

      const quizzesByCourseTmp: QuizzesByCourse = {};
      data.forEach((quiz: any) => {
        const sortedResponses = quiz.quiz_responses.sort((a: any, b: any) => 
          b.attempt_number - a.attempt_number
        );
        
        const latestResponse = sortedResponses.length > 0 ? sortedResponses[0] : undefined;
        
        const processedQuiz: Quiz = {
          ...quiz,
          latest_response: latestResponse,
        };

        if (!quizzesByCourseTmp[quiz.course_id]) {
          quizzesByCourseTmp[quiz.course_id] = [];
        }
        quizzesByCourseTmp[quiz.course_id].push(processedQuiz);
      });
      
      setQuizzesByCourse(quizzesByCourseTmp);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to load quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [location.key]);

  useEffect(() => {
    if (courses.length > 0 && Object.keys(quizzesByCourse).length > 0) {
      const processed = courses.map(course => {
        const courseQuizzes = quizzesByCourse[course.id] || [];
        
        const processedQuizzes: ProcessedQuiz[] = courseQuizzes.map(quiz => {
          // Calculate score from only the latest response
          const scorePercentage = quiz.latest_response ? 
            Math.round((quiz.latest_response.score / quiz.latest_response.total_questions) * 100) : 0;
            
          return {
            id: quiz.id,
            title: quiz.title,
            creator: quiz.profiles ? `${quiz.profiles.first_name} ${quiz.profiles.last_name}` : 'Anonymous',
            duration: quiz.duration_minutes > 0 ? `${quiz.duration_minutes} minutes` : 'No time limit',
            previousScore: scorePercentage,
            attemptNumber: quiz.latest_response ? quiz.latest_response.attempt_number : 0,
            totalQuestions: quiz.latest_response ? quiz.latest_response.total_questions : 10,
            status: quiz.latest_response ? 'completed' : 'not_attempted',
            allowRetake: quiz.allow_retakes
          };
        });
        
        return {
          ...course,
          quizzes: processedQuizzes
        };
      });
      
      setProcessedCourses(processed.filter(course => course.quizzes.length > 0));
    }
  }, [courses, quizzesByCourse]);

  const handleViewResults = (quizId: string) => {
    for (const courseId in quizzesByCourse) {
      const quiz = quizzesByCourse[courseId].find(q => q.id === quizId);
      if (quiz && quiz.latest_response) {
        navigate(`/quiz-results/${quiz.latest_response.id}`);
        return;
      }
    }
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/take-quiz/${quizId}`);
  };

  const handleRetakeQuiz = (quizId: string) => {
    for (const courseId in quizzesByCourse) {
      const quiz = quizzesByCourse[courseId].find(q => q.id === quizId);
      if (quiz) {
        setConfirmRetakeQuiz(quiz);
        return;
      }
    }
  };

  const handleRetakeConfirm = () => {
    if (confirmRetakeQuiz) {
      navigate(`/take-quiz/${confirmRetakeQuiz.id}`);
      setConfirmRetakeQuiz(null);
    }
  };

  const handleCreateQuiz = () => {
    navigate('/quiz-generation');
  };

  const filteredCourses = processedCourses
    .map(course => {
      const filteredQuizzes = course.quizzes.filter(quiz => {
        const matchesSearch = searchTerm === "" || 
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = selectedStatus === "all" || 
          (selectedStatus === "not_attempted" && quiz.status === "not_attempted") ||
          (selectedStatus === "in_progress" && quiz.status === "in_progress") ||
          (selectedStatus === "completed" && quiz.status === "completed");
        
        return matchesSearch && matchesStatus;
      });
      
      return {
        ...course,
        quizzes: filteredQuizzes
      };
    })
    .filter(course => {
      return course.quizzes.length > 0 && 
        (selectedCourse === "all" || course.id === selectedCourse);
    });

  const totalQuizCount = processedCourses.reduce(
    (total, course) => total + course.quizzes.length, 
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const showEmptyState = totalQuizCount === 0;

  return (
    <div className="container mx-auto py-6 space-y-8">
      <QuizFilters
        searchTerm={searchTerm}
        selectedCourse={selectedCourse}
        selectedStatus={selectedStatus}
        courses={courses}
        setSearchTerm={setSearchTerm}
        setSelectedCourse={setSelectedCourse}
        setSelectedStatus={setSelectedStatus}
        handleCreateQuiz={handleCreateQuiz}
        refreshQuizzes={fetchQuizzes}
      />

      {showEmptyState && (
        <QuizzesEmptyState onCreateQuiz={handleCreateQuiz} />
      )}

      {!showEmptyState && (
        <div className="space-y-8">
          {filteredCourses.map((course) => (
            <CourseQuizSection
              key={course.id}
              course={course}
              onViewResults={handleViewResults}
              onStartQuiz={handleStartQuiz}
              onRetakeQuiz={handleRetakeQuiz}
            />
          ))}
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
        <QuizDisclaimer />
      </div>

      {confirmRetakeQuiz && (
        <RetakeConfirmDialog
          open={!!confirmRetakeQuiz}
          onOpenChange={(open) => {
            if (!open) setConfirmRetakeQuiz(null);
          }}
          onConfirm={handleRetakeConfirm}
          quizTitle={confirmRetakeQuiz.title}
          previousScore={confirmRetakeQuiz.latest_response ? 
            confirmRetakeQuiz.latest_response.score : 
            undefined}
        />
      )}
    </div>
  );
}
