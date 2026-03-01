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
    // Warm paper aesthetic - subtle cream treatment
    return "bg-[#FFF8DC]/70 text-black/70 border-black/10";
  };

  const getStatusBadge = () => {
    switch (course.status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-[#FFD700]/18 text-black/75 border-black/10">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Completed
          </Badge>
        );
      case "active":
        return progress > 0 ? (
          <Badge variant="outline" className="bg-[#FFE4B5]/55 text-black/70 border-black/10">
            In Progress
          </Badge>
        ) : null;
      default:
        return null;
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
                <Badge variant="outline" className={getLevelColor(course.level)}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
                {getStatusBadge()}
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
          <p className="text-sm text-black/60 line-clamp-2 mb-5 leading-relaxed">
            {course.description || `A ${course.pace_weeks}-week journey exploring ${course.topic}`}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-5 text-xs text-black/45 mb-5">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" />
              {course.pace_weeks} modules
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(course.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-xs">
              <span className="text-black/45">Progress</span>
              <span className="text-black/75 font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-black/5" indicatorClassName="bg-[#B8860B]" />
          </div>

          {/* Action Button */}
          <Button
            className="w-full rounded-full py-5 text-black bg-gradient-to-br from-[#FFF8DC]/90 to-[#FFE4B5]/90 border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_25px_rgba(184,134,11,0.18)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_18px_40px_rgba(184,134,11,0.26)] hover:-translate-y-[1px] transition-all"
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
