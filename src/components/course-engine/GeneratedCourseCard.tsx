import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { BookOpen, Clock, MoreVertical, Trash2, Play, CheckCircle } from "lucide-react";
import { GeneratedCourse } from "@/types/course-engine";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface GeneratedCourseCardProps {
  course: GeneratedCourse;
  progress?: number;
  onClick?: () => void;
  onDelete?: (courseId: string) => Promise<boolean>;
}

export const GeneratedCourseCard = ({
  course,
  progress = 0,
  onClick,
  onDelete,
}: GeneratedCourseCardProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    const success = await onDelete(course.id);
    setIsDeleting(false);
    if (success) {
      setShowDeleteDialog(false);
    }
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/courses/generated/${course.id}`);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = () => {
    switch (course.status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "active":
        return progress > 0 ? (
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
            In Progress
          </Badge>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300">
        {/* Gradient Accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={getLevelColor(course.level)}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
                {getStatusBadge()}
              </div>
              <h3 className="font-semibold text-foreground line-clamp-2 text-lg">
                {course.title}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description || `A ${course.pace_weeks}-week journey exploring ${course.topic}`}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.pace_weeks} modules
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(course.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Action Button */}
          <Button
            className="w-full"
            onClick={handleClick}
          >
            <Play className="h-4 w-4 mr-2" />
            {progress > 0 ? "Continue Learning" : "Start Course"}
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{course.title}" and all your progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || !onDelete}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
