import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InternshipTask, InternshipEvent } from "@/types/internship";
import { format, isToday, isFuture, isSameDay, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isTaskOverdue, formatInUserTimezone, formatDeadlineWithContext } from "@/utils/dateUtils";

interface CalendarViewProps {
  events: InternshipEvent[];
  tasks: InternshipTask[];
  startDate: string;
  onOpenTaskDetails?: (task: InternshipTask) => void;
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

export function CalendarView({ events, tasks, startDate, onOpenTaskDetails }: CalendarViewProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const openTaskFromCalendar = (taskId?: string) => {
    if (!taskId || !onOpenTaskDetails) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onOpenTaskDetails(task);
    }
  };
  
  // Convert events and task due dates to a unified format for display
  const calendarItems: CalendarItem[] = [
    // Add events
    ...events.map(event => ({
      id: `event-${event.id}`,
      title: event.title,
      date: new Date(event.event_date),
      time: formatInUserTimezone(event.event_date, 'h:mm a'),
      type: event.event_type,
      color: event.event_type === 'meeting' ? 
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800' :
        event.event_type === 'milestone' ? 
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800' :
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
    })),
    
    // Add tasks as deadlines
    ...tasks.map(task => {
      const deadlineInfo = formatDeadlineWithContext(task.due_date);
      return {
      id: `task-${task.id}`,
      title: `${task.title}`,
      date: new Date(task.due_date),
        time: formatInUserTimezone(task.due_date, 'h:mm a'),
      type: 'deadline',
      status: task.status,
      taskId: task.id,
      isCompleted: task.status === 'completed',
      color: task.status === 'completed' ? 
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800' :
          deadlineInfo.urgency === 'overdue' ?
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800' :
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
      };
    })
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
    return date >= today || isSameDay(date, today);
  }).slice(0, 14);
  
  // Helper function to check if a date has events or tasks
  const hasEventsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return groupedByDate[dateStr] && groupedByDate[dateStr].length > 0;
  };
  
  // Get items for the selected date
  const selectedDateItems = selectedDate ? 
    groupedByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : [];
  
  const getStatusIcon = (status: string, isPastDue: boolean) => {
    if (status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (isPastDue) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Widget */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Calendar View</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Date Picker with Popover */}
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {/* Date Picker Trigger */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                      showOutsideDays={false}
                      className="rounded-md border-0"
                      modifiers={{
                        hasEvents: (date) => hasEventsOnDate(date),
                        overdue: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          const items = groupedByDate[dateStr] || [];
                          return items.some(item => 
                            item.type === 'deadline' && 
                            isTaskOverdue(format(date, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'')) && 
                            item.status !== 'completed'
                          );
                        }
                      }}
                      modifiersStyles={{
                        hasEvents: { 
                          backgroundColor: 'hsl(var(--primary))', 
                          color: 'hsl(var(--primary-foreground))',
                          fontWeight: 'bold'
                        },
                        overdue: { 
                          backgroundColor: 'hsl(var(--destructive))', 
                          color: 'hsl(var(--destructive-foreground))',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                
                {/* Quick Date Selection Buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                    className={cn(
                      "text-xs",
                      selectedDate && isToday(selectedDate) && "bg-primary text-primary-foreground"
                    )}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(addDays(new Date(), 1))}
                    className="text-xs"
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(addDays(new Date(), 7))}
                    className="text-xs"
                  >
                    Next Week
          </Button>
        </div>
              </div>
              
              {/* Calendar Legend */}
              <div className="flex flex-wrap gap-3 text-xs justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  <span className="text-muted-foreground">Events/Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-destructive"></div>
                  <span className="text-muted-foreground">Overdue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-primary bg-background"></div>
                  <span className="text-muted-foreground">Selected</span>
                </div>
              </div>
            </div>
            
            {/* Selected Date Details */}
            <div className="space-y-4 min-h-[400px]">
              <div className="border rounded-lg p-4 bg-muted/20">
                <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {selectedDate ? (
                    isToday(selectedDate) ? "Today" : format(selectedDate, "PPP")
                  ) : "Select a date"}
                </h3>
                
                {selectedDate && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                )}
                
                {selectedDate && selectedDateItems.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateItems.map((item) => {
                      const isPastDue = item.type === 'deadline' && item.status !== 'completed' && isTaskOverdue(item.date.toISOString());
                      
                      return (
                        <div 
                          key={item.id} 
                          className={`border rounded-lg p-3 ${item.color} transition-all hover:shadow-sm`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2 items-start">
                              {item.type === 'deadline' && (
                                getStatusIcon(item.status || '', isPastDue)
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                <div className="text-xs mt-1 flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{format(item.date, "p")}</span>
                                  </div>
                                  {item.type === 'deadline' && (
                                    <Badge variant="outline" className="text-xs">
                                      Due Date
                                    </Badge>
                                  )}
                                  {item.type === 'meeting' && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                                      Meeting
                                    </Badge>
                                  )}
                                  {item.type === 'milestone' && (
                                    <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                      Milestone
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {item.taskId && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => openTaskFromCalendar(item.taskId)}
                              >
                                Open
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No events scheduled</p>
                    <p className="text-xs">This date is free</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm font-medium">Select a date</p>
                    <p className="text-xs">Click on any date to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
        {relevantDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium">No Upcoming Events</h3>
            <p className="text-sm text-muted-foreground mt-1">Future events and deadlines will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
              {relevantDates.slice(0, 5).map(dateKey => {
              const itemsOnDate = groupedByDate[dateKey];
              const dateObj = new Date(dateKey);
              const isCurrentDay = isToday(dateObj);
              
              return (
                <div key={dateKey} className="space-y-2">
                  <div className={cn(
                    "flex items-center gap-2 text-sm font-medium py-1",
                    isCurrentDay ? "text-primary" : ""
                  )}>
                      <CalendarIcon className="h-4 w-4" />
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
                        const isPastDue = item.type === 'deadline' && item.status !== 'completed' && isTaskOverdue(item.date.toISOString());
                      
                      return (
                        <div 
                          key={item.id} 
                            className={`border rounded-lg p-3 ${item.color} cursor-pointer transition-colors hover:bg-opacity-80`}
                            onClick={() => setSelectedDate(item.date)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2 items-start">
                              {item.type === 'deadline' && (
                                getStatusIcon(item.status || '', isPastDue)
                              )}
                              <div>
                                <h4 className="font-medium text-sm">{item.title}</h4>
                                  <div className="text-xs mt-1 flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5" />
                                      <span>{format(item.date, "p")}</span>
                                    </div>
                                  {item.type === 'deadline' && (
                                      <Badge variant="outline" className="text-xs">
                                      Due Date
                                      </Badge>
                                    )}
                                    {item.type === 'meeting' && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                                        Meeting
                                      </Badge>
                                    )}
                                    {item.type === 'milestone' && (
                                      <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                                        Milestone
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {item.taskId && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleTaskAction(item.taskId!, item.isCompleted || false)}
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
        </CardContent>
      </Card>
      </div>
  );
}
