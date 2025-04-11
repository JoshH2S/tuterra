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
  const [courseStats, setCourseStats] = useState({
    completedQuizzes: 0,
    studentCount: 0
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  
  // Calculate progress value based on completed quizzes out of 10
  const maxQuizzes = 10;
  const progressValue = Math.min((courseStats.completedQuizzes / maxQuizzes) * 100, 100);
  
  // Determine expertise level based on progress
  const expertiseLevel = 
    progressValue >= 100 ? "Expert" :
    progressValue >= 70 ? "Advanced" :
    progressValue >= 40 ? "Intermediate" :
    progressValue >= 10 ? "Beginner" : 
    "Novice";

  // Fetch course statistics from the database, using both quiz_responses and student_quiz_scores
  useEffect(() => {
    const fetchCourseStats = async () => {
      try {
        setIsStatsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Fetch from both tables and get the most complete picture
        const [quizScoresResult, quizResponsesResult] = await Promise.all([
          // Get completed quizzes from student_quiz_scores
          supabase
            .from('student_quiz_scores')
            .select('id')
            .eq('course_id', course.id)
            .eq('student_id', user.id),
          
          // Get completed quizzes from quiz_responses
          supabase
            .from('quiz_responses')
            .select(`
              id,
              quiz_id,
              completed_at,
              quizzes(
                course_id
              )
            `)
            .eq('student_id', user.id)
            .not('completed_at', 'is', null) // Using 'is' operator instead of 'eq' for null checks
        ]);

        // Count completed quizzes from quiz_responses for this course
        const completedFromResponses = quizResponsesResult.data
          ? quizResponsesResult.data.filter(r => 
              r.quizzes && r.quizzes.course_id === course.id
            ).length
          : 0;

        // Count from student_quiz_scores
        const completedFromScores = quizScoresResult.data
          ? quizScoresResult.data.length
          : 0;

        // Use the highest count from either source
        const completedQuizzes = Math.max(completedFromResponses, completedFromScores);

        setCourseStats({
          studentCount: 0, // We're keeping this in the state but not displaying it
          completedQuizzes: completedQuizzes
        });
      } catch (error) {
        console.error('Error fetching course stats:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchCourseStats();
  }, [course.id]);

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
          completedQuizzes={courseStats.completedQuizzes}
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
