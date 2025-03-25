import { useState, useEffect, useCallback } from "react";
import { StudySession } from "@/hooks/useStudySessions";
import { StudentCourse } from "@/types/student";
import { Task } from "./TaskItem";
import { isAfter, isBefore, isPast, addDays, format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export function useTasksFromSessions(
  sessions: StudySession[] = [], 
  courses: StudentCourse[] = []
) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const processSessionsIntoTasks = useCallback((sessions: StudySession[], courses: StudentCourse[]) => {
    const sessionTasks = sessions
      .filter(session => {
        const sessionDate = new Date(session.start_time);
        return session.status !== 'completed' && 
               isAfter(sessionDate, new Date()) && 
               isBefore(sessionDate, addDays(new Date(), 7));
      })
      .map(session => {
        const course = courses.find(c => c.course_id === session.course_id);
        const sessionDate = new Date(session.start_time);
        const missed = session.status === 'missed' || (isPast(sessionDate) && session.status === 'scheduled');
        
        return {
          id: `session-${session.id}`,
          title: session.title,
          description: course ? `For ${course.course.title} at ${format(sessionDate, 'h:mm a')}` : 
                    `At ${format(sessionDate, 'h:mm a')}`,
          completed: session.status === 'completed',
          dueDate: sessionDate,
          courseId: session.course_id,
          sessionId: session.id,
          missed
        };
      });

    const missedSessions = sessionTasks.filter(task => task.missed);
    if (missedSessions.length > 0) {
      missedSessions.forEach(task => {
        toast({
          title: "Missed Study Session",
          description: `You missed your scheduled session: ${task.title}`,
          variant: "destructive"
        });
      });
    }

    return sessionTasks;
  }, []);

  useEffect(() => {
    const sessionTasks = processSessionsIntoTasks(sessions, courses);
    
    setTasks(prevTasks => {
      const customTasks = prevTasks.filter(task => !task.id.startsWith('session-'));
      return [...customTasks, ...sessionTasks];
    });
  }, [sessions, courses, processSessionsIntoTasks]);

  return { tasks, setTasks };
}
