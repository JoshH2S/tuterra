import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ui/modern-card";
import { InternshipEvent, InternshipTask } from "./SwipeableInternshipView";
import { format, isToday, isPast, isFuture, isSameDay, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CalendarViewProps {
  events: InternshipEvent[];
  tasks: InternshipTask[];
  sessionId: string;
  updateTaskStatus?: (taskId: string, status: 'not_started' | 'in_progress' | 'completed') => Promise<void>;
}

interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: string;
  color: string;
  status?: string;
  taskId?: string;
  isCompleted?: boolean;
}

export function CalendarView({ events, tasks, sessionId, updateTaskStatus }: CalendarViewProps) {
  const navigate = useNavigate();
  
  // Convert events and task due dates to a unified format for display
  const calendarItems: CalendarItem[] = [
    // Add events
    ...events.map(event => ({
      id: `event-${event.id}`,
      title: event.title,
      date: new Date(event.date),
      time: format(new Date(event.date), 'h:mm a'),
      type: event.type,
      color: event.type === 'meeting' ? 
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800' :
        event.type === 'milestone' ? 
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800' :
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
    })),
    
    // Add tasks as deadlines
    ...tasks.map(task => ({
      id: `task-${task.id}`,
      title: `${task.title}`,
      date: new Date(task.due_date),
      time: format(new Date(task.due_date), 'h:mm a'),
      type: 'deadline',
      status: task.status,
      taskId: task.id,
      isCompleted: task.status === 'completed',
      color: task.status === 'completed' ? 
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800' :
        isPast(new Date(task.due_date)) && task.status !== 'completed' ?
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800' :
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
    }))
  ];
  
  // Group items by date for better organization
  const groupedByDate: Record<string, CalendarItem[]> = {};
  
  calendarItems.forEach(item => {
    const dateKey = format(item.date, 'yyyy-MM-dd');
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(item);
  });
  
  // Sort dates chronologically
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );
  
  // Get upcoming dates (today and next 14 days)
  const today = new Date();
  const relevantDates = sortedDates.filter(dateStr => {
    const date = new Date(dateStr);
    return !isPast(date) || isSameDay(date, today);
  }).slice(0, 14);
  
  // Handle task action
  const handleTaskAction = async (taskId: string, status: string) => {
    if (!updateTaskStatus) return;
    
    if (status === 'completed') {
      // Toggle completed task back to in_progress
      await updateTaskStatus(taskId, 'in_progress');
    } else {
      // Mark task as completed
      await updateTaskStatus(taskId, 'completed');
    }
  };
  
  const getStatusIcon = (status: string, isPastDue: boolean) => {
    if (status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (isPastDue) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };
  
  const goToCalendarView = () => {
    navigate(`/dashboard/virtual-internship?sessionId=${sessionId}&tab=2`);
  };

  return (
    <ModernCard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Calendar</h2>
          <Button variant="outline" size="sm" onClick={goToCalendarView}>
            View Full
          </Button>
        </div>
        
        {relevantDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium">No Upcoming Events</h3>
            <p className="text-sm text-muted-foreground mt-1">Future events and deadlines will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {relevantDates.map(dateKey => {
              const itemsOnDate = groupedByDate[dateKey];
              const dateObj = new Date(dateKey);
              const isCurrentDay = isToday(dateObj);
              
              return (
                <div key={dateKey} className="space-y-2">
                  <div className={cn(
                    "flex items-center gap-2 text-sm font-medium py-1",
                    isCurrentDay ? "text-primary" : ""
                  )}>
                    <Calendar className="h-4 w-4" />
                    <span>
                      {isCurrentDay ? "Today" : format(dateObj, "EEEE, MMMM d")}
                    </span>
                    {isCurrentDay && (
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                        Today
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {itemsOnDate.map((item) => {
                      const isPastDue = isPast(item.date) && !isToday(item.date);
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`border rounded-lg p-3 ${item.color}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2 items-start">
                              {item.type === 'deadline' && (
                                getStatusIcon(item.status || '', isPastDue)
                              )}
                              <div>
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <div className="text-xs mt-1 flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1.5 inline" />
                                  {item.time}
                                  {item.type === 'deadline' && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      Due Date
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {item.taskId && updateTaskStatus && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskAction(item.taskId!, item.status || '');
                                }}
                              >
                                {item.isCompleted ? "Reopen" : "Complete"}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ModernCard>
  );
}
