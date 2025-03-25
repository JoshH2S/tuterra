
import { useState } from "react";
import { CalendarView } from "./calendar/CalendarView";
import { SessionsList } from "./calendar/SessionsList";
import { SessionForm } from "./calendar/SessionForm";
import { CreateStudySessionData } from "@/types/study-sessions";
import type { StudySession } from "@/hooks/useStudySessions";
import type { StudentCourse } from "@/types/student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudyCalendarProps {
  sessions: StudySession[];
  courses: StudentCourse[];
  onCreateSession: (session: CreateStudySessionData) => Promise<void>;
}

export function StudyCalendar({ sessions, courses, onCreateSession }: StudyCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Study Schedule</CardTitle>
        <SessionForm 
          courses={courses} 
          selectedDate={date} 
          onCreateSession={onCreateSession} 
        />
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          <CalendarView selectedDate={date} onDateSelect={setDate} />
          <SessionsList date={date} sessions={sessions} courses={courses} />
        </div>
      </CardContent>
    </Card>
  );
}
