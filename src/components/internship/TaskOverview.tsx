
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InternshipTask } from "./SwipeableInternshipView";
import { format } from "date-fns";

interface TaskOverviewProps {
  tasks: InternshipTask[];
  updateTaskStatus: (taskId: string, status: 'not_started' | 'in_progress' | 'completed') => Promise<void>;
}

export function TaskOverview({ tasks, updateTaskStatus }: TaskOverviewProps) {
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'completed':
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800";
      case 'overdue':
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
      case 'in_progress':
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
    }
  };
  
  const handleTaskAction = (task: InternshipTask) => {
    if (task.status === 'not_started') {
      updateTaskStatus(task.id, 'in_progress');
    } else if (task.status === 'in_progress' || task.status === 'overdue') {
      updateTaskStatus(task.id, 'completed');
    } else if (task.status === 'completed') {
      // Re-open task if previously completed
      updateTaskStatus(task.id, 'in_progress');
    }
  };
  
  const getActionButtonText = (status: string) => {
    switch(status) {
      case 'completed':
        return "Reopen Task";
      case 'overdue':
      case 'in_progress':
        return "Mark Complete";
      default:
        return "Start Task";
    }
  };
  
  // Sort tasks by status (incomplete first) then by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    // First by completion status
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    
    // Then by overdue status
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    
    // Then by due date
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <ModernCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tasks & Deliverables</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No Tasks Available</h3>
            <p className="text-sm text-muted-foreground">
              Your tasks will appear here once they are assigned.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <div key={task.id} className="border rounded-lg overflow-hidden">
                <div className="flex items-center p-3 border-b bg-muted/20 gap-3">
                  {getStatusIcon(task.status)}
                  <h3 className="font-medium flex-1 text-sm md:text-base">{task.title}</h3>
                  <Badge className={`${getStatusBadgeColor(task.status)} text-xs whitespace-nowrap`}>
                    {task.status === 'not_started' ? 'Not Started' : 
                     task.status === 'in_progress' ? 'In Progress' : 
                     task.status === 'overdue' ? 'Overdue' : 
                     'Completed'}
                  </Badge>
                </div>
                
                <div className="p-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-muted-foreground">
                      Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs h-8 px-3 touch-manipulation"
                      onClick={() => handleTaskAction(task)}
                    >
                      {getActionButtonText(task.status)}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModernCard>
  );
}
