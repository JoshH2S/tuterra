
import { Button } from "@/components/ui/button";
import { ModernCard } from "@/components/ui/modern-card";

// Mock calendar events
const events = [
  { 
    id: 1, 
    title: "Team Meeting", 
    date: "May 25, 2025", 
    time: "10:00 AM", 
    type: "meeting",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
  },
  { 
    id: 2, 
    title: "Market Analysis Due", 
    date: "May 26, 2025", 
    time: "11:59 PM", 
    type: "deadline",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800"
  },
  { 
    id: 3, 
    title: "Mentor Check-in", 
    date: "May 28, 2025", 
    time: "2:30 PM", 
    type: "meeting",
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800"
  },
  { 
    id: 4, 
    title: "Module Milestone", 
    date: "May 31, 2025", 
    time: "All Day", 
    type: "milestone",
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800"
  },
];

export function CalendarView() {
  return (
    <ModernCard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Calendar</h2>
          <Button variant="outline" size="sm">
            View Full
          </Button>
        </div>
        
        <div className="space-y-3">
          {events.map((event) => (
            <div 
              key={event.id} 
              className={`border rounded-lg p-3 ${event.color}`}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{event.title}</h4>
                <span className="text-xs font-medium uppercase">
                  {event.type}
                </span>
              </div>
              <div className="text-sm mt-1">
                {event.date} • {event.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModernCard>
  );
}
