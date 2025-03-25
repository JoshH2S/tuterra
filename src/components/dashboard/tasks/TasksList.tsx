import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Circle, MoreHorizontal } from "lucide-react";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { format } from "date-fns";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TasksListProps {
  sessions: StudySession[];
  courses: StudentCourse[];
  onCreateSession: () => void;
  onUpdateSession?: (id: string, updates: Partial<StudySession>) => Promise<void>;
}

export function TasksList({ 
  sessions, 
  courses, 
  onCreateSession,
  onUpdateSession 
}: TasksListProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Filter sessions based on the selected filter
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.start_time);
    sessionDate.setHours(0, 0, 0, 0);
    
    if (filter === 'all') {
      return true;
    } else if (filter === 'upcoming') {
      return !session.completed && sessionDate >= today;
    } else if (filter === 'completed') {
      return session.completed;
    }
    return true;
  });
  
  // Sort sessions by date (upcoming first)
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    // First sort by completion status
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Then sort by date
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });
  
  // Get course title by ID
  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.course_id === courseId);
    return course?.course?.title || 'Unknown Course';
  };
  
  // Handle session completion toggle
  const handleToggleComplete = async (session: StudySession) => {
    if (onUpdateSession) {
      await onUpdateSession(session.id, { completed: !session.completed });
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Study Tasks</CardTitle>
        <Button onClick={onCreateSession} size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={filter === 'upcoming' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button 
            variant={filter === 'completed' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
          <Button 
            variant={filter === 'all' ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
        
        <div className="space-y-2">
          {sortedSessions.length > 0 ? (
            sortedSessions.map((session) => {
              const sessionDate = new Date(session.start_time);
              const isToday = sessionDate.toDateString() === today.toDateString();
              const isPast = sessionDate < today && !isToday;
              
              return (
                <div 
                  key={session.id} 
                  className={cn(
                    "flex items-start p-3 rounded-md border",
                    session.completed ? "bg-muted/50" : "",
                    isPast && !session.completed ? "border-yellow-200 bg-yellow-50" : ""
                  )}
                >
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    <Checkbox 
                      checked={session.completed}
                      onCheckedChange={() => handleToggleComplete(session)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "font-medium truncate",
                        session.completed ? "line-through text-muted-foreground" : ""
                      )}>
                        {session.title || `Study session for ${getCourseTitle(session.course_id)}`}
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleComplete(session)}>
                            {session.completed ? "Mark as incomplete" : "Mark as complete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <span className="truncate">{getCourseTitle(session.course_id)}</span>
                      <span className="mx-1">•</span>
                      <span>
                        {isToday ? 'Today' : format(sessionDate, 'MMM d')}
                        {', '}
                        {format(new Date(session.start_time), 'h:mm a')}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {session.topic && (
                        <Badge variant="outline" className="text-xs">
                          {session.topic}
                        </Badge>
                      )}
                      {isPast && !session.completed && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {filter === 'upcoming' ? (
                <>
                  <p>No upcoming study sessions</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onCreateSession}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule a session
                  </Button>
                </>
              ) : filter === 'completed' ? (
                <p>No completed study sessions</p>
              ) : (
                <p>No study sessions found</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
