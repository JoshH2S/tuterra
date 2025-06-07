import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InternshipSession, InternshipTask } from "@/types/internship";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, CheckCircle2, Clock, AlertCircle, ChevronRight, Briefcase, Plus, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ActivityStreakDisplay } from "./ActivityStreakDisplay";

interface WelcomePanelProps {
  sessionData: InternshipSession;
  tasks: InternshipTask[];
  startDate: string; // Changed from optional to required since we provide a fallback
  onOpenTaskDetails?: (task: InternshipTask) => void;
}

export function WelcomePanel({ 
  sessionData, 
  tasks, 
  startDate, 
  onOpenTaskDetails 
}: WelcomePanelProps) {
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InternshipTask | null>(null);
  
  // Calculate internship progress percentage
  const calculateProgress = () => {
    // Default to 4 weeks if duration_weeks is not provided
    const durationWeeks = sessionData.duration_weeks || 4;
    const totalDurationMs = durationWeeks * 7 * 24 * 60 * 60 * 1000;
    
    const startDateObj = new Date(startDate);
    const currentDate = new Date();
    const elapsedMs = currentDate.getTime() - startDateObj.getTime();
    
    // Cap progress at 100%
    let progressPercentage = Math.min((elapsedMs / totalDurationMs) * 100, 100);
    
    // Ensure progress is at least 1% if internship has started
    if (currentDate > startDateObj && progressPercentage < 1) {
      progressPercentage = 1;
    }
    
    // Ensure progress is non-negative
    return Math.max(0, Math.round(progressPercentage));
  };
  
  // Count completed tasks
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const totalTasks = tasks.length;
  const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Not Started</Badge>;
    }
  };
  
  // Sort tasks by priority (overdue first, then in progress, then not started)
  const sortedTasks = [...tasks].sort((a, b) => {
    // First prioritize by status
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
    if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
    
    // Then by due date
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
  
  // Take only the first 2 tasks for display
  const displayTasks = sortedTasks.slice(0, 2);
  
  // Handle task click - either use provided callback or open modal
  const handleTaskClick = (task: InternshipTask) => {
    if (onOpenTaskDetails) {
      onOpenTaskDetails(task);
    } else {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  return (
    <>
      {/* Main Internship Progress Panel */}
      <Card className="bg-card/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="text-xl flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              {sessionData.job_title}
            </CardTitle>
            <CardDescription>
              Virtual Internship in {sessionData.industry}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress Statistics */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Internship Progress</span>
                  <span className="font-medium">{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2.5" />
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Start Date</div>
                  <div className="text-sm font-medium mt-1">
                    {formatDate(startDate)}
                  </div>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Task Completion</div>
                  <div className="text-sm font-medium mt-1">
                    {completedTasks}/{totalTasks} tasks ({taskCompletion}%)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity Streak */}
            <div className="md:border-l md:pl-6">
              <ActivityStreakDisplay sessionId={sessionData.id} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Current Tasks Panel with 2 tasks */}
      <Card className="mt-6 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Current Tasks
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsTaskModalOpen(true)}
            className="h-8 gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No tasks available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3 border rounded-md ${
                    task.status === 'completed' ? 'bg-green-50/50 border-green-100' : 
                    task.status === 'overdue' ? 'bg-red-50/50 border-red-100' : 
                    task.status === 'in_progress' ? 'bg-amber-50/50 border-amber-100' : 
                    'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : task.status === 'overdue' ? (
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {format(new Date(task.due_date), 'MMM d, h:mm a')}</span>
                            </div>
                            {task.task_type && (
                              <div className="capitalize text-xs font-medium">
                                {task.task_type.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => handleTaskClick(task)}
                    >
                      View Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Task List Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>All Tasks</DialogTitle>
            <DialogDescription>
              Complete these tasks to progress in your internship
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-3 py-4">
              {sortedTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3 border rounded-md ${
                    task.status === 'completed' ? 'bg-green-50/50 border-green-100' : 
                    task.status === 'overdue' ? 'bg-red-50/50 border-red-100' : 
                    task.status === 'in_progress' ? 'bg-amber-50/50 border-amber-100' : 
                    'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : task.status === 'overdue' ? (
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {format(new Date(task.due_date), 'MMM d, h:mm a')}</span>
                            </div>
                            {task.task_type && (
                              <div className="capitalize text-xs font-medium">
                                {task.task_type.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => handleTaskClick(task)}
                    >
                      Details
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
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
