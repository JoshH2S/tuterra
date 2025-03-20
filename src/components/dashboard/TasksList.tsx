import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckCircle2, Clock, GraduationCap, ChevronRight, AlertTriangle } from "lucide-react";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, isPast, addDays } from "date-fns";
import { useSwipeable } from "react-swipeable";
import { toast } from "@/hooks/use-toast";

interface TasksListProps {
  sessions?: StudySession[];
  courses?: StudentCourse[];
  onCreateSession?: () => void;
  onUpdateSession?: (id: string, updates: Partial<StudySession>) => Promise<void>;
}

type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  courseId?: string;
  sessionId?: string;
  missed?: boolean;
};

export function TasksList({ 
  sessions = [], 
  courses = [], 
  onCreateSession,
  onUpdateSession 
}: TasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const sessionTasks = sessions
      .filter(session => {
        const sessionDate = new Date(session.start_time);
        return session.status !== 'completed' && 
               isAfter(sessionDate, new Date()) && 
               isBefore(sessionDate, addDays(new Date(), 7));
      })
      .map(session => {
        const course = courses.find(c => c.course_id === session.course_id);
        const sessionDate = new Date(session.start_time);
        const missed = session.status === 'missed' || (isPast(sessionDate) && session.status === 'scheduled');
        
        return {
          id: `session-${session.id}`,
          title: session.title,
          description: course ? `For ${course.course.title} at ${format(sessionDate, 'h:mm a')}` : 
                      `At ${format(sessionDate, 'h:mm a')}`,
          completed: session.status === 'completed',
          dueDate: sessionDate,
          courseId: session.course_id,
          sessionId: session.id,
          missed
        };
      });

    const missedSessions = sessionTasks.filter(task => task.missed);
    if (missedSessions.length > 0) {
      missedSessions.forEach(task => {
        toast({
          title: "Missed Study Session",
          description: `You missed your scheduled session: ${task.title}`,
          variant: "destructive"
        });
      });
    }

    setTasks(prevTasks => {
      const customTasks = prevTasks.filter(task => !task.id.startsWith('session-'));
      return [...customTasks, ...sessionTasks];
    });
  }, [sessions, courses]);

  const handleToggleComplete = async (taskId: string, checked: boolean | string) => {
    if (taskId.startsWith('session-') && onUpdateSession) {
      const sessionId = taskId.replace('session-', '');
      try {
        await onUpdateSession(sessionId, { 
          status: checked ? 'completed' : 'scheduled' 
        });
        
        toast({
          title: checked ? "Session Completed" : "Session Reopened",
          description: checked ? "Nice work! The study session has been marked as completed." : "The study session has been reopened.",
          variant: "default"
        });
      } catch (error) {
        console.error("Failed to update session status:", error);
        toast({
          title: "Error",
          description: "Failed to update session status. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }

    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !!checked } : task
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
            className="touch-manipulation"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Study
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No upcoming tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks
              .filter(task => !task.completed)
              .sort((a, b) => {
                if (a.missed && !b.missed) return -1;
                if (!a.missed && b.missed) return 1;
                if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
                return 0;
              })
              .map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  courses={courses}
                  isExpanded={expandedTaskId === task.id}
                  onToggle={() => toggleExpandTask(task.id)}
                  onComplete={(checked) => handleToggleComplete(task.id, checked)} 
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
  onComplete: (checked: boolean | string) => void;
}

function TaskItem({ task, courses, isExpanded, onToggle, onComplete }: TaskItemProps) {
  const course = task.courseId 
    ? courses.find(c => c.course_id === task.courseId)
    : undefined;

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
