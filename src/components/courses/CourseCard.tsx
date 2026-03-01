
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Clock, MoreVertical, Trash2, FileEdit, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Course } from "@/types/course";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { StudentPerformance } from "@/types/student";
import { CourseEditDialog } from "./course-card/CourseEditDialog";
import { CourseDeleteDialog } from "./course-card/CourseDeleteDialog";

interface CourseCardProps {
  course: Course;
  onCourseUpdated?: () => void;
  onCourseDeleted?: () => void;
}

export const CourseCard = ({ course, onCourseUpdated, onCourseDeleted }: CourseCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedTitle, setEditedTitle] = useState(course.title);
  const [editedDescription, setEditedDescription] = useState(course.description || "");
  const [performanceData, setPerformanceData] = useState<StudentPerformance | null>(null);

  const maxQuizzes = 10;
  const completedQuizzes = performanceData?.completed_quizzes || 0;
  const progressValue = Math.min((completedQuizzes / maxQuizzes) * 100, 100);

  const expertiseLevel =
    progressValue >= 100 ? "Expert" :
    progressValue >= 70 ? "Advanced" :
    progressValue >= 40 ? "Intermediate" :
    progressValue >= 10 ? "Beginner" :
    "Novice";

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("student_performance")
          .select("id, student_id, course_id, total_quizzes, completed_quizzes, average_score, last_activity, strengths, areas_for_improvement, courses(title)")
          .eq("student_id", user.id)
          .eq("course_id", course.id)
          .maybeSingle();

        if (data) {
          setPerformanceData(data);
        }
      } catch (error) {
        console.error("Error fetching performance:", error);
      }
    };
    fetchPerformance();
  }, [course.id]);

  const handleEditCourse = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ title: editedTitle, description: editedDescription })
        .eq("id", course.id);
      if (error) throw error;
      toast({ title: "Course updated", description: "The course has been updated successfully." });
      setIsEditDialogOpen(false);
      if (onCourseUpdated) onCourseUpdated();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update course.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("courses").delete().eq("id", course.id);
      if (error) throw error;
      toast({ title: "Course deleted", description: "The course has been deleted successfully." });
      setIsDeleteDialogOpen(false);
      if (onCourseDeleted) onCourseDeleted();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete course.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden border border-white/20 bg-white/40 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),0_16px_32px_rgba(0,0,0,0.12)] hover:bg-white/50 transition-all duration-300 hover:-translate-y-1 rounded-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-[#FFF8DC]/70 text-black/70 border-black/10">
                  {expertiseLevel}
                </Badge>
              </div>
              <h3 className="font-medium text-foreground line-clamp-2 text-lg leading-relaxed">
                {course.title}
              </h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-black/45 hover:text-black/80 opacity-60 group-hover:opacity-100 transition">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="text-sm text-black/60 line-clamp-2 mb-5 leading-relaxed">
            {course.description || "No description provided"}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-5 text-xs text-black/45 mb-5">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" />
              {completedQuizzes}/{maxQuizzes} quizzes
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(course.created_at || new Date()), { addSuffix: true })}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-xs">
              <span className="text-black/45">Progress</span>
              <span className="text-black/75 font-medium">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-1.5 bg-black/5" indicatorClassName="bg-[#B8860B]" />
          </div>

          {/* Action Button */}
          <Button
            asChild
            className="w-full rounded-full py-5 text-black bg-gradient-to-br from-[#FFF8DC]/90 to-[#FFE4B5]/90 border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_25px_rgba(184,134,11,0.18)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(184,134,11,0.26)] hover:-translate-y-[1px] transition-all"
          >
            <Link to={`/courses/${course.id}/grades`}>
              <Play className="h-4 w-4 mr-2" />
              {completedQuizzes > 0 ? "Continue Course" : "Start Course"}
            </Link>
          </Button>
        </div>
      </Card>

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
    </>
  );
};
