import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ArrowRight, Clock, MoreVertical, Trash2, CheckCircle2 } from "lucide-react";
import { GeneratedCourse } from "@/types/course-engine";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

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

  const isCompleted = course.status === "completed";
  const isInProgress = course.status === "active" && progress > 0;
  const levelLabel = course.level.charAt(0).toUpperCase() + course.level.slice(1);

  const ctaLabel = isCompleted
    ? "Review Course"
    : progress > 0
    ? "Continue Learning"
    : "Start Course";

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden rounded-2xl cursor-pointer",
          "border border-[#C8A84B]/40",
          "bg-gradient-to-b from-[#FBF7EF] to-white",
          "shadow-[0_4px_16px_-8px_rgba(184,134,11,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)]",
          "hover:border-[#C8A84B]/70",
          "hover:shadow-[0_12px_32px_-12px_rgba(184,134,11,0.28),inset_0_1px_0_0_rgba(255,255,255,1)]",
          "hover:-translate-y-1 transition-all duration-300"
        )}
        onClick={handleClick}
      >
        {/* Top gold hairline */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A84B]/60 to-transparent" />

        <div className="flex flex-col h-full p-6">
          {/* Eyebrow row: level + status + menu */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pr-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[#9a7f2a]">
                {levelLabel}
              </span>
              {isCompleted && (
                <>
                  <span className="h-1 w-1 rounded-full bg-[#C8A84B]/60" />
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7f2a]">
                    <CheckCircle2 className="h-3 w-3" strokeWidth={1.8} />
                    Completed
                  </span>
                </>
              )}
              {isInProgress && !isCompleted && (
                <>
                  <span className="h-1 w-1 rounded-full bg-[#C8A84B]/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7f2a]">
                    In Progress
                  </span>
                </>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mt-1 -mr-1 h-8 w-8 text-[#8a7a5a] opacity-50 group-hover:opacity-100 hover:text-[#1a1a1a] hover:bg-[#C8A84B]/10 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h3 className="font-manrope text-[17px] font-medium leading-snug tracking-tight text-[#1a1a1a] line-clamp-2 mb-3">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] leading-relaxed text-[#5a5040]/85 line-clamp-2 mb-5">
            {course.description || `A ${course.pace_weeks}-week journey exploring ${course.topic}`}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.18em] text-[#8a7a5a] mb-5">
            <span className="tabular-nums">
              {course.pace_weeks} {course.pace_weeks === 1 ? "Week" : "Weeks"}
            </span>
            <span className="h-1 w-1 rounded-full bg-[#C8A84B]/50" />
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" strokeWidth={1.8} />
              {formatDistanceToNow(new Date(course.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Progress */}
          <div className="mb-6 mt-auto">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8a7a5a]">
                Progress
              </span>
              <span className="font-manrope text-sm font-medium tabular-nums text-[#1a1a1a]">
                {progress}
                <span className="text-xs text-[#8a7a5a] ml-0.5">%</span>
              </span>
            </div>
            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[#C8A84B]/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#DAA520] to-[#B8860B] transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={cn(
              "w-full rounded-full py-5 font-semibold text-white",
              "bg-gradient-to-br from-[#DAA520] to-[#B8860B]",
              "shadow-[0_6px_20px_-8px_rgba(184,134,11,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]",
              "hover:from-[#E4B333] hover:to-[#C99416]",
              "hover:shadow-[0_10px_26px_-8px_rgba(184,134,11,0.65),inset_0_1px_0_rgba(255,255,255,0.3)]",
              "transition-all duration-200"
            )}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </Card>

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
