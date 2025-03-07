
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/course";
import { Filter, Plus, Search, ChevronRight } from "lucide-react";
import { Select } from "@/components/ui/select-simple";
import { QuizCard } from "@/components/quizzes/QuizCard";
import { QuizzesEmptyState } from "@/components/quizzes/QuizzesEmptyState";
import { RetakeConfirmDialog } from "@/components/quiz-taking/RetakeConfirmDialog";
import { useCourses } from "@/hooks/useCourses";
import { useIsMobile } from "@/hooks/use-mobile";

interface Quiz {
  id: string;
  title: string;
  course_id: string;
  duration_minutes: number;
  allow_retakes: boolean;
  profiles: {
    first_name: string;
    last_name: string;
  };
  latest_response?: {
    id: string;
    score: number;
    total_questions: number;
    attempt_number: number;
  };
}

interface QuizzesByCourse {
  [courseId: string]: Quiz[];
}

interface ProcessedQuiz {
  id: string;
  title: string;
  teacher: string;
  duration: string;
  previousScore: number;
  attemptNumber: number;
  totalQuestions: number;
  status: 'not_attempted' | 'in_progress' | 'completed';
  allowRetake: boolean;
}

interface ProcessedCourse extends Course {
  quizzes: ProcessedQuiz[];
}

export default function Quizzes() {
  const [quizzesByCourse, setQuizzesByCourse] = useState<QuizzesByCourse>({});
  const [processedCourses, setProcessedCourses] = useState<ProcessedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmRetakeQuiz, setConfirmRetakeQuiz] = useState<Quiz | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const navigate = useNavigate();
  const { courses } = useCourses();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('quizzes')
          .select(`
            *,
            profiles:teacher_id (
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
          // Sort responses by attempt number in descending order to get the latest one
          const sortedResponses = quiz.quiz_responses.sort((a: any, b: any) => 
            b.attempt_number - a.attempt_number
          );
          
          // Get only the latest response (first one after sorting)
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

    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && Object.keys(quizzesByCourse).length > 0) {
      const processed = courses.map(course => {
        const courseQuizzes = quizzesByCourse[course.id] || [];
        
        const processedQuizzes: ProcessedQuiz[] = courseQuizzes.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          teacher: `${quiz.profiles.first_name} ${quiz.profiles.last_name}`,
          duration: quiz.duration_minutes > 0 ? `${quiz.duration_minutes} minutes` : 'No time limit',
          previousScore: quiz.latest_response ? Math.round((quiz.latest_response.score / quiz.latest_response.total_questions) * 100) : 0,
          attemptNumber: quiz.latest_response ? quiz.latest_response.attempt_number : 0,
          totalQuestions: quiz.latest_response ? quiz.latest_response.total_questions : 10,
          status: quiz.latest_response ? 'completed' : 'not_attempted',
          allowRetake: quiz.allow_retakes
        }));
        
        return {
          ...course,
          quizzes: processedQuizzes
        };
      });
      
      setProcessedCourses(processed.filter(course => course.quizzes.length > 0));
    }
  }, [courses, quizzesByCourse]);

  const handleViewResults = (quizId: string) => {
    // Find the quiz to get its response ID
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
    // Find the quiz
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

  // Filter courses and quizzes based on search and filters
  const filteredCourses = processedCourses
    .map(course => {
      // Filter quizzes by search term and status
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
      // Only include the course if it has quizzes matching the filters
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

  // Build course options for the select dropdown
  const courseOptions = [
    { label: 'All Courses', value: 'all' },
    ...courses.map(course => ({
      label: course.title || course.id,
      value: course.id
    }))
  ];

  // Check if we should show empty state
  const showEmptyState = totalQuizCount === 0;

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Page Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Available Quizzes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your course quizzes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button onClick={handleCreateQuiz}>
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search quizzes..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          placeholder="Course"
          options={courseOptions}
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full md:w-48"
        />
        
        <Select
          placeholder="Status"
          options={[
            { label: 'All Status', value: 'all' },
            { label: 'Not Attempted', value: 'not_attempted' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Completed', value: 'completed' }
          ]}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-48"
        />
      </div>

      {/* Empty State */}
      {showEmptyState && (
        <QuizzesEmptyState onCreateQuiz={handleCreateQuiz} />
      )}

      {/* Course Sections */}
      {!showEmptyState && (
        <div className="space-y-8">
          {filteredCourses.map((course) => (
            <section key={course.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
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
                    onViewResults={handleViewResults}
                    onStartQuiz={handleStartQuiz}
                    onRetakeQuiz={handleRetakeQuiz}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

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
