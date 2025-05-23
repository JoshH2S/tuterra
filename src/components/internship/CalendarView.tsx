
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ui/modern-card";
import { InternshipEvent, InternshipTask } from "./SwipeableInternshipView";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface CalendarViewProps {
  events: InternshipEvent[];
  tasks: InternshipTask[];
}

interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: string;
  color: string;
}

export function CalendarView({ events, tasks }: CalendarViewProps) {
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
      title: `${task.title} Due`,
      date: new Date(task.due_date),
      time: format(new Date(task.due_date), 'h:mm a'),
      type: 'deadline',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800'
    }))
  ];
  
  // Sort by date, most recent first
  const sortedItems = calendarItems.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <ModernCard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Calendar</h2>
          <Button variant="outline" size="sm">
            View Full
          </Button>
        </div>
        
        {sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium">No Events</h3>
            <p className="text-sm text-muted-foreground mt-1">Events and deadlines will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div 
                key={item.id} 
                className={`border rounded-lg p-3 ${item.color}`}
              >
                <div className="flex justify-between">
                  <h4 className="font-medium">{item.title}</h4>
                  <Badge variant="outline" className="text-xs font-medium uppercase">
                    {item.type}
                  </Badge>
                </div>
                <div className="text-sm mt-1 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 inline" />
                  {format(item.date, 'MMM d, yyyy')}
                  <span className="mx-1">•</span>
                  <Clock className="h-3.5 w-3.5 mr-1.5 inline" />
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModernCard>
  );
}
