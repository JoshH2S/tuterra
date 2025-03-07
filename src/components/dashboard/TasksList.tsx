
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckCircle2, Clock, GraduationCap, ChevronRight } from "lucide-react";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { useSwipeable } from "react-swipeable";

interface TasksListProps {
  sessions?: StudySession[];
  courses?: StudentCourse[];
  onCreateSession?: () => void;
}

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  courseId?: string;
  sessionId?: string;
};

export function TasksList({ sessions = [], courses = [], onCreateSession }: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Convert upcoming study sessions to tasks
  const sessionTasks: Task[] = sessions
    .filter(session => {
      const sessionDate = new Date(session.start_time);
      // Only include sessions that are coming up (next 7 days) and not in the past
      return isAfter(sessionDate, new Date()) && 
             isBefore(sessionDate, addDays(new Date(), 7));
    })
    .map(session => {
      const course = courses.find(c => c.course_id === session.course_id);
      const sessionDate = new Date(session.start_time);
      
      return {
        id: `session-${session.id}`,
        title: session.title,
        description: course ? `For ${course.course.title} at ${format(sessionDate, 'h:mm a')}` : 
                    `At ${format(sessionDate, 'h:mm a')}`,
        completed: false,
        dueDate: sessionDate,
        courseId: session.course_id,
        sessionId: session.id
      };
    });

  // Combine user tasks with session tasks
  const allTasks = [...tasks, ...sessionTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    return 0;
  });

  const handleToggleComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const toggleExpandTask = (taskId: string) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
            <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
          </div>
          <Button 
            size="sm" 
            onClick={onCreateSession}
            className="touch-manipulation" // Improve touch target
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Study
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {allTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No upcoming tasks</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCreateSession}
              className="touch-manipulation min-h-[44px]"
            >
              Schedule a study session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {allTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                courses={courses}
                isExpanded={expandedTaskId === task.id}
                onToggle={() => toggleExpandTask(task.id)}
                onComplete={(e) => handleToggleComplete(task.id, e)} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskItemProps {
  task: Task;
  courses: StudentCourse[];
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: (e: React.MouseEvent) => void;
}

function TaskItem({ task, courses, isExpanded, onToggle, onComplete }: TaskItemProps) {
  const course = task.courseId 
    ? courses.find(c => c.course_id === task.courseId)
    : undefined;

  // Setup swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onToggle(),
    onSwipedRight: () => onToggle(),
    trackMouse: false
  });

  return (
    <motion.div
      {...swipeHandlers}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border touch-manipulation",
        task.completed ? "bg-gray-50 dark:bg-gray-800/20" : "bg-white dark:bg-gray-800"
      )}
      onClick={onToggle}
    >
      <div className="pt-0.5 min-w-[28px]">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={onComplete}
          className="h-5 w-5"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className={cn(
            "text-sm font-medium",
            task.completed ? "text-muted-foreground line-through" : ""
          )}>
            {task.title}
          </p>
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
        </motion.div>
        
        <div className="flex flex-wrap items-center gap-3 mt-1">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(task.dueDate, 'MMM d, h:mm a')}
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
