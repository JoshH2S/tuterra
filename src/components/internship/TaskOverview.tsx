import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, ChevronRight, LockKeyhole, Calendar, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InternshipTask } from "@/types/internship";
import { format, isPast, isFuture, addDays } from "date-fns";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { formatInUserTimezone, formatDeadlineWithContext } from "@/utils/dateUtils";

interface TaskOverviewProps {
  tasks: InternshipTask[];
  onUpdateTaskStatus: (taskId: string, status: 'not_started' | 'in_progress' | 'completed') => Promise<void>;
  onOpenTaskDetails?: (task: InternshipTask) => void;
  allTasks?: InternshipTask[]; // All tasks including those not yet visible
  compact?: boolean; // Add compact mode option
  maxDisplayCount?: number; // Maximum number of tasks to display
}

export function TaskOverview({ 
  tasks, 
  onUpdateTaskStatus, 
  onOpenTaskDetails, 
  allTasks = [], 
  compact = false,
  maxDisplayCount
}: TaskOverviewProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
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
  
  // Open task details rather than changing status from summary views
  const openTaskDetails = (task: InternshipTask) => {
    if (onOpenTaskDetails) {
      onOpenTaskDetails(task);
    }
  };
  
  const getActionButtonText = (_status: string) => {
    return "Open";
  };
  
  // Find the next upcoming task that's not yet visible
  const findNextUpcomingTask = () => {
    if (!allTasks || allTasks.length === 0) return null;
    
    const now = new Date();
    const visibleTaskIds = new Set(tasks.map(t => t.id));
    
    // Get tasks that aren't visible yet, sorted by their visible_after date
    const upcomingTasks = allTasks
      .filter(task => !visibleTaskIds.has(task.id) && task.visible_after)
      .sort((a, b) => {
        const dateA = new Date(a.visible_after!);
        const dateB = new Date(b.visible_after!);
        return dateA.getTime() - dateB.getTime();
      });
    
    return upcomingTasks.length > 0 ? upcomingTasks[0] : null;
  };
  
  const nextUpcomingTask = findNextUpcomingTask();
  
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

  // Determine how many tasks to display
  const tasksToDisplay = maxDisplayCount || (compact ? 3 : 2);
  
  // Display tasks based on mode and count
  const displayTasks = compact 
    ? sortedTasks.filter(t => t.status !== 'completed').slice(0, tasksToDisplay) 
    : sortedTasks.slice(0, tasksToDisplay);
  
  // Compact layout for sidebar or dashboard
  if (compact) {
    return (
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-2">
            No tasks available yet
          </div>
        ) : (
          <>
            {displayTasks.map((task) => (
              <div 
                key={task.id} 
                className="border rounded-md overflow-hidden text-xs cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onOpenTaskDetails && onOpenTaskDetails(task)}
              >
                <div className="flex items-center p-2 gap-1.5 bg-muted/20">
                  {getStatusIcon(task.status)}
                  <span className="font-medium truncate">{task.title}</span>
                </div>
                <div className="p-2 flex justify-between items-center border-t">
                  <span className="text-muted-foreground text-[10px]">
                    Due: {formatInUserTimezone(task.due_date, 'MMM d')}
                  </span>
                  <div className="flex gap-1">
                    {/* Testing button to mark as complete */}
                    {task.status !== 'completed' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-1 text-[10px] bg-green-50 hover:bg-green-100 text-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateTaskStatus(task.id, 'completed');
                        }}
                      >
                        ✓
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 px-1.5 text-[10px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTaskDetails(task);
                      }}
                    >
                      {getActionButtonText(task.status)}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {(tasks.length > displayTasks.length || allTasks.length > tasks.length) && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs mt-1 border-dashed"
                onClick={() => setIsTaskModalOpen(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                View All Tasks ({allTasks.length > 0 ? allTasks.length : tasks.length})
              </Button>
            )}
            
            {/* Task List Modal */}
            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>All Tasks ({tasks.length})</DialogTitle>
                  <DialogDescription>
                    Complete these tasks to progress in your internship
                  </DialogDescription>
                </DialogHeader>
                
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  <div className="space-y-2 py-2">
                    {sortedTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-2 border rounded-md text-xs ${
                          task.status === 'completed' ? 'bg-green-50/50 border-green-100' : 
                          task.status === 'overdue' ? 'bg-red-50/50 border-red-100' : 
                          task.status === 'in_progress' ? 'bg-amber-50/50 border-amber-100' : 
                          'bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-1.5">
                            {getStatusIcon(task.status)}
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-muted-foreground">
                                  Due: {formatInUserTimezone(task.due_date, 'MMM d, yyyy \'at\' h:mm a')}
                                </span>
                                <Badge className={`${getStatusBadgeColor(task.status)} text-[10px] h-4 px-1.5 whitespace-nowrap`}>
                                  {task.status === 'not_started' ? 'Not Started' : 
                                   task.status === 'in_progress' ? 'In Progress' : 
                                   task.status === 'overdue' ? 'Overdue' : 
                                   'Completed'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 px-1.5 text-[10px]"
                            onClick={() => openTaskDetails(task)}
                          >
                            {getActionButtonText(task.status)}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <DialogFooter className="flex items-center justify-between">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    );
  }

  // Regular layout
  return (
    <>
      <ModernCard>
        <div className="p-3 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Tasks & Deliverables</h2>
            {(tasks.length > 2 || allTasks.length > tasks.length) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsTaskModalOpen(true)}
                className="h-8 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                View All ({allTasks.length > 0 ? allTasks.length : tasks.length})
              </Button>
            )}
          </div>
          
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
              {displayTasks.map((task) => (
                <div key={task.id} className="border rounded-lg overflow-hidden relative">
                  <div className="flex items-center p-2.5 sm:p-3 border-b bg-muted/20 gap-2 sm:gap-3">
                    {getStatusIcon(task.status)}
                    <h3 className="font-medium flex-1 text-sm md:text-base pr-16 sm:pr-0">{task.title}</h3>
                    <Badge className={`${getStatusBadgeColor(task.status)} text-[10px] sm:text-xs whitespace-nowrap absolute top-2 right-2 sm:static`}>
                      {task.status === 'not_started' ? 'Not Started' : 
                       task.status === 'in_progress' ? 'In Progress' : 
                       task.status === 'overdue' ? 'Overdue' : 
                       'Completed'}
                    </Badge>
                  </div>
                  
                  <div className="p-2.5 sm:p-3">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        Due: {formatInUserTimezone(task.due_date, 'MMM d, yyyy \'at\' h:mm a')}
                      </div>
                      <div className="flex gap-1.5 sm:gap-2">
                        {/* Testing button to mark as complete */}
                        {task.status !== 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-8 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateTaskStatus(task.id, 'completed');
                            }}
                          >
                            ✓ Complete
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-8 px-3 touch-manipulation"
                          onClick={() => openTaskDetails(task)}
                        >
                          {getActionButtonText(task.status)}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModernCard>
      
      {/* Task List Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>All Tasks ({allTasks.length > 0 ? allTasks.length : tasks.length} Total)</DialogTitle>
            <DialogDescription>
              Your complete internship task list - current and upcoming tasks
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-4 py-4">
              
              {/* Current/Visible Tasks Section */}
              {tasks.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Current Tasks ({tasks.length})
                  </h4>
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
                              Due: {formatInUserTimezone(task.due_date, 'MMM d, yyyy \'at\' h:mm a')}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs h-8 px-3 touch-manipulation"
                              onClick={() => openTaskDetails(task)}
                            >
                              {getActionButtonText(task.status)}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upcoming Tasks Section (now openable, not locked) */}
              {allTasks.length > tasks.length && (
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Upcoming Tasks ({allTasks.length - tasks.length})
                  </h4>
                  <div className="space-y-3">
                    {allTasks
                      .filter(task => !tasks.find(t => t.id === task.id))
                      .sort((a, b) => {
                        // Sort by visible_after date, then by due_date
                        const aDate = new Date(a.visible_after || a.due_date);
                        const bDate = new Date(b.visible_after || b.due_date);
                        return aDate.getTime() - bDate.getTime();
                      })
                      .map((task) => (
                        <div key={task.id} className="border rounded-lg overflow-hidden border-blue-200 bg-blue-50/30 dark:bg-blue-900/10 dark:border-blue-800/50">
                          <div className="flex items-center p-3 border-b bg-muted/20 gap-3">
                            <h3 className="font-medium flex-1 text-sm md:text-base">{task.title}</h3>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs whitespace-nowrap">
                              Upcoming
                            </Badge>
                          </div>

                          <div className="p-3">
                            <p className="text-sm text-muted-foreground mb-3">
                              {task.description || "This task will be unlocked as you progress through your internship."}
                            </p>

                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="text-xs flex items-center text-blue-700">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 inline" />
                                {task.visible_after ? (
                                  <>Available: {format(new Date(task.visible_after), 'MMM d, yyyy')}</>
                                ) : (
                                  <>Due: {formatInUserTimezone(task.due_date, 'MMM d, yyyy')}</>
                                )}
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs h-8 px-3"
                                onClick={() => openTaskDetails(task)}
                              >
                                Open
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Summary Stats */}
              {allTasks.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Internship Progress</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Total Tasks:</span>
                      <span className="font-medium ml-1">{allTasks.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Available Now:</span>
                      <span className="font-medium ml-1">{tasks.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium ml-1 text-green-600">{tasks.filter(t => t.status === 'completed').length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Upcoming:</span>
                      <span className="font-medium ml-1 text-blue-600">{allTasks.length - tasks.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
