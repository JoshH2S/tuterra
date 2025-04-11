
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Course } from "@/types/course";
import { supabase } from "@/integrations/supabase/client";
import { useResponsive } from "@/hooks/useResponsive";
import { toast } from "@/hooks/use-toast";
import { CourseCardHeader } from "./course-card/CourseCardHeader";
import { CourseMasterySection } from "./course-card/CourseMasterySection";
import { CourseQuickActions } from "./course-card/CourseQuickActions";
import { CourseEditDialog } from "./course-card/CourseEditDialog";
import { CourseDeleteDialog } from "./course-card/CourseDeleteDialog";
import { StudentPerformance } from "@/types/student";

interface CourseCardProps {
  course: Course;
  onCourseUpdated?: () => void;
  onCourseDeleted?: () => void;
}

export const CourseCard = ({ course, onCourseUpdated, onCourseDeleted }: CourseCardProps) => {
  const { isMobile } = useResponsive();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedTitle, setEditedTitle] = useState(course.title);
  const [editedDescription, setEditedDescription] = useState(course.description || "");
  const [performanceData, setPerformanceData] = useState<StudentPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate progress value based on completed quizzes out of 10
  const maxQuizzes = 10;
  const completedQuizzes = performanceData?.completed_quizzes || 0;
  const progressValue = Math.min((completedQuizzes / maxQuizzes) * 100, 100);
  
  // Determine expertise level based on progress
  const expertiseLevel = 
    progressValue >= 100 ? "Expert" :
    progressValue >= 70 ? "Advanced" :
    progressValue >= 40 ? "Intermediate" :
    progressValue >= 10 ? "Beginner" : 
    "Novice";

  // Fetch course performance from the student_performance table
  useEffect(() => {
    const fetchCoursePerformance = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Fetch performance data for this course
        const { data: performanceData, error: performanceError } = await supabase
          .from('student_performance')
          .select(`
            id,
            student_id,
            course_id,
            total_quizzes,
            completed_quizzes,
            average_score,
            last_activity,
            strengths,
            areas_for_improvement,
            courses(
              title
            )
          `)
          .eq('student_id', user.id)
          .eq('course_id', course.id)
          .maybeSingle();

        if (performanceError && performanceError.code !== 'PGRST116') { // Not found is ok
          console.error('Error fetching performance:', performanceError);
        }

        if (performanceData) {
          setPerformanceData(performanceData);
        } else {
          // If no performance data found, check quiz_responses as a fallback
          const { data: responses, error: responsesError } = await supabase
            .from('quiz_responses')
            .select(`
              id,
              quiz_id,
              score,
              total_questions,
              completed_at,
              quizzes(
                course_id
              )
            `)
            .eq('student_id', user.id)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: false });

          if (responsesError) {
            console.error('Error fetching quiz responses:', responsesError);
          } else {
            // Filter responses for this course
            const courseResponses = responses?.filter(
              r => r.quizzes && r.quizzes.course_id === course.id
            ) || [];
            
            if (courseResponses.length > 0) {
              // Calculate average score
              const totalScore = courseResponses.reduce((acc, curr) => acc + curr.score, 0);
              const avgScore = courseResponses.length > 0 ? totalScore / courseResponses.length : 0;
              
              // Create performance object
              const syntheticPerformance: StudentPerformance = {
                id: 'synthetic',
                student_id: user.id,
                course_id: course.id,
                total_quizzes: courseResponses.length,
                completed_quizzes: courseResponses.length,
                average_score: avgScore,
                last_activity: courseResponses[0].completed_at,
                course_title: course.title,
                courses: { title: course.title }
              };
              
              setPerformanceData(syntheticPerformance);
            } else {
              setPerformanceData(null);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course performance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoursePerformance();
  }, [course.id, course.title]);

  const handleEditCourse = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('courses')
        .update({ 
          title: editedTitle,
          description: editedDescription 
        })
        .eq('id', course.id);

      if (error) throw error;
      
      toast({
        title: "Course updated",
        description: "The course has been updated successfully.",
      });
      
      setIsEditDialogOpen(false);
      
      // If a callback was provided, call it to refresh the courses list
      if (onCourseUpdated) onCourseUpdated();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id);

      if (error) throw error;
      
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });
      
      setIsDeleteDialogOpen(false);
      
      // If a callback was provided, call it to refresh the courses list
      if (onCourseDeleted) onCourseDeleted();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      whileHover={!isMobile ? { y: -4 } : undefined}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <CourseCardHeader course={course} />

      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Created {format(new Date(course.created_at || new Date()), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <CourseMasterySection 
          completedQuizzes={completedQuizzes}
          maxQuizzes={maxQuizzes}
          expertiseLevel={expertiseLevel}
          progressValue={progressValue}
        />

        <CourseQuickActions 
          courseId={course.id}
          onEditClick={() => setIsEditDialogOpen(true)}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
      </div>

      <CourseEditDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title={editedTitle}
        setTitle={setEditedTitle}
        description={editedDescription}
        setDescription={setEditedDescription}
        onSave={handleEditCourse}
        isSubmitting={isSubmitting}
      />

      <CourseDeleteDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDeleteCourse}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
};
