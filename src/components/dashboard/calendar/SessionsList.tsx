
import { format } from "date-fns";
import { Clock, GraduationCap } from "lucide-react";
import type { StudySession } from "@/hooks/useStudySessions";
import type { StudentCourse } from "@/types/student";

interface SessionsListProps {
  date: Date | undefined;
  sessions: StudySession[];
  courses: StudentCourse[];
}

export function SessionsList({ date, sessions, courses }: SessionsListProps) {
  // Filter sessions for the selected date
  const sessionsForDate = sessions.filter(session => {
    const sessionDate = new Date(session.start_time);
    return date && 
      sessionDate.getDate() === date.getDate() &&
      sessionDate.getMonth() === date.getMonth() &&
      sessionDate.getFullYear() === date.getFullYear();
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        Sessions for {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}
      </h3>
      {sessionsForDate.length === 0 ? (
        <p className="text-muted-foreground">No study sessions scheduled for this date.</p>
      ) : (
        <div className="space-y-3">
          {sessionsForDate.map((session) => {
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);
            const course = courses.find(c => c.course_id === session.course_id);

            return (
              <div
                key={session.id}
                className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="font-medium">{session.title}</div>
                {session.description && (
                  <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                  </div>
                  {course && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {course.course.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
