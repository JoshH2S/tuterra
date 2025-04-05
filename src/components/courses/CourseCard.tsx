
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/types/course";
import { Calendar, Users, BookOpen, MoreHorizontal, FileEdit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/useResponsive";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  
  // These would be real in a production app, but we'll mock them for now
  const completedQuizzes = 7; // This would come from the database in a real app
  const studentCount = 24;
  
  // Calculate progress value based on completed quizzes out of 10
  const maxQuizzes = 10;
  const progressValue = Math.min((completedQuizzes / maxQuizzes) * 100, 100);
  
  // Determine expertise level based on progress
  const expertiseLevel = 
    progressValue >= 100 ? "Expert" :
    progressValue >= 70 ? "Advanced" :
    progressValue >= 40 ? "Intermediate" :
    progressValue >= 10 ? "Beginner" : 
    "Novice";
  
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
      {/* Course Header */}
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200" />
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {course.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Created {format(new Date(course.created_at || new Date()), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Created {format(new Date(course.created_at || new Date()), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {studentCount} Students
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Course Mastery</span>
            <span className="text-sm text-gray-600">{expertiseLevel} ({completedQuizzes}/{maxQuizzes} quizzes)</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/courses/${course.id}/grades`}>
              <BookOpen className="w-4 h-4 mr-2" />
              View Course
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className="flex items-center py-2 px-3 cursor-pointer touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 rounded-md transition-colors"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <FileEdit className="w-4 h-4 mr-2" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center py-2 px-3 cursor-pointer touch-manipulation hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 rounded-md transition-colors text-red-600 dark:text-red-400"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All course materials and student records associated 
              with this course will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCourse();
              }}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input 
                id="title" 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)} 
                placeholder="Enter course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input 
                id="description" 
                value={editedDescription} 
                onChange={(e) => setEditedDescription(e.target.value)} 
                placeholder="Enter course description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditCourse} disabled={isSubmitting || !editedTitle.trim()}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
