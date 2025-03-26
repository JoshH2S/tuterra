
import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Calendar as CalendarIcon } from "lucide-react";
import type { StudySession } from "@/hooks/useStudySessions";
import { useCourses } from "@/hooks/useCourses";

interface SessionsListProps {
  date?: Date;
  sessions: StudySession[];
}

export function SessionsList({ date, sessions }: SessionsListProps) {
  const { courses } = useCourses();
  
  const filteredSessions = useMemo(() => {
    if (!date || !sessions.length) return [];
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return isSameDay(sessionDate, date);
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [date, sessions]);

  const getCourseTitle = (courseId: string | null) => {
    if (!courseId) return 'No course';
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown course';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>;
      default:
        return <Badge variant="outline" className="border-blue-500 text-blue-500"><Clock className="h-3 w-3 mr-1" /> Scheduled</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CalendarIcon className="h-5 w-5 mr-2" />
          {date ? (
            <span>Sessions for {format(date, 'MMMM d, yyyy')}</span>
          ) : (
            <span>Select a date to view sessions</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!date ? (
          <p className="text-muted-foreground text-center py-8">
            Please select a date to view scheduled sessions
          </p>
        ) : filteredSessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No study sessions scheduled for this day
          </p>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div key={session.id} className="border rounded-md p-4 hover:border-primary">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{session.title}</h3>
                  {getStatusBadge(session.status)}
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  <div>{getCourseTitle(session.course_id)}</div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                    </span>
                  </div>
                </div>
                
                {session.description && (
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                    {session.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
