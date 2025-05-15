
import { useState } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, GraduationCap, ChevronRight, AlertTriangle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSwipeable } from "react-swipeable";
import { Badge } from "@/components/ui/badge";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  courseId?: string;
  sessionId?: string;
  missed?: boolean;
  status?: string;
  hasFeedback?: boolean;
}

interface TaskItemProps {
  task: Task;
  courses: any[];
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: (checked: boolean | string) => void;
  onViewFeedback?: (task: Task) => void;
}

export function TaskItem({ 
  task, 
  courses, 
  isExpanded, 
  onToggle, 
  onComplete,
  onViewFeedback
}: TaskItemProps) {
  const course = task.courseId 
    ? courses.find(c => c.course_id === task.courseId)
    : undefined;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onToggle(),
    onSwipedRight: () => onToggle(),
    trackMouse: false
  });

  // Determine if the task has feedback available
  const showFeedbackButton = task.status === 'feedback_given' || task.hasFeedback;

  return (
    <motion.div
      {...swipeHandlers}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border touch-manipulation",
        task.completed ? "bg-gray-50 dark:bg-gray-800/20" : 
        task.missed ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30" : 
        "bg-white dark:bg-gray-800"
      )}
      onClick={onToggle}
    >
      <div className="pt-0.5 min-w-[28px]" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={onComplete}
          className="h-5 w-5"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {task.missed && (
              <AlertTriangle className="h-4 w-4 text-red-500 mr-1.5 flex-shrink-0" />
            )}
            <p className={cn(
              "text-sm font-medium",
              task.completed ? "text-muted-foreground line-through" : 
              task.missed ? "text-red-600 dark:text-red-400" : ""
            )}>
              {task.title}
            </p>
            {showFeedbackButton && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                Feedback Available
              </Badge>
            )}
          </div>
          <ChevronRight 
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              isExpanded ? "rotate-90" : ""
            )} 
          />
        </div>
        
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : '1.5rem' }}
          className="overflow-hidden"
        >
          {task.description && (
            <p className={cn(
              "text-sm text-muted-foreground",
              !isExpanded && "truncate"
            )}>
              {task.description}
            </p>
          )}

          {isExpanded && showFeedbackButton && onViewFeedback && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onViewFeedback(task)}
                className="text-sm flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                View Feedback
              </button>
            </div>
          )}
        </motion.div>
        
        <div className="flex flex-wrap items-center gap-3 mt-1">
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              task.missed ? "text-red-500" : "text-muted-foreground"
            )}>
              <Clock className="h-3 w-3" />
              {format(task.dueDate, 'MMM d, h:mm a')}
              {task.missed && " (Missed)"}
            </div>
          )}
          
          {course && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <GraduationCap className="h-3 w-3" />
              {course.course.title}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
