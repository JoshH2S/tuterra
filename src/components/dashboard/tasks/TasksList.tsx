
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, ArrowDown } from "lucide-react";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { toast } from "@/hooks/use-toast";
import { TaskItem, Task } from "./TaskItem";
import { TasksEmptyState } from "./TasksEmptyState";
import { useTasksFromSessions } from "./useTasksFromSessions";

interface TasksListProps {
  sessions?: StudySession[];
  courses?: StudentCourse[];
  onCreateSession?: () => void;
  onUpdateSession?: (id: string, updates: Partial<StudySession>) => Promise<void>;
}

export function TasksList({ 
  sessions = [], 
  courses = [], 
  onCreateSession,
  onUpdateSession 
}: TasksListProps) {
  const { tasks, setTasks } = useTasksFromSessions(sessions, courses);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [visibleTasks, setVisibleTasks] = useState<number>(5);
  const PAGE_SIZE = 5;

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

  const loadMoreTasks = () => {
    setVisibleTasks(prev => prev + PAGE_SIZE);
  };

  // Get incomplete tasks sorted by priority
  const incompleteTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      if (a.missed && !b.missed) return -1;
      if (!a.missed && b.missed) return 1;
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
      return 0;
    });

  // Apply pagination to tasks
  const paginatedTasks = incompleteTasks.slice(0, visibleTasks);
  const hasMoreTasks = incompleteTasks.length > visibleTasks;

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
            className="touch-manipulation px-4 sm:px-6 min-w-[140px] py-2 h-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Study
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {incompleteTasks.length === 0 ? (
          <TasksEmptyState />
        ) : (
          <div className="space-y-3">
            {paginatedTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                courses={courses}
                isExpanded={expandedTaskId === task.id}
                onToggle={() => toggleExpandTask(task.id)}
                onComplete={(checked) => handleToggleComplete(task.id, checked)} 
              />
            ))}
            
            {hasMoreTasks && (
              <Button 
                variant="ghost" 
                className="w-full mt-2" 
                onClick={loadMoreTasks}
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                Load More ({incompleteTasks.length - visibleTasks} remaining)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
