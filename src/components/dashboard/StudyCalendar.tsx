
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarView } from "./calendar/CalendarView";
import { SessionsList } from "./calendar/SessionsList";
import { SessionForm } from "./calendar/SessionForm";
import { CreateStudySessionData } from "@/types/study-sessions";
import type { StudySession } from "@/hooks/useStudySessions";
import type { StudentCourse } from "@/types/student";

interface StudyCalendarProps {
  sessions: StudySession[];
  courses: StudentCourse[];
  onCreateSession: (session: CreateStudySessionData) => Promise<void>;
}

export function StudyCalendar({ sessions, courses, onCreateSession }: StudyCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Study Schedule</CardTitle>
          <SessionForm 
            courses={courses} 
            selectedDate={date} 
            onCreateSession={onCreateSession} 
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Modified grid layout to ensure better spacing for mobile */}
        <div className="grid md:grid-cols-2 gap-6">
          <CalendarView selectedDate={date} onDateSelect={setDate} />
          <SessionsList date={date} sessions={sessions} courses={courses} />
        </div>
      </CardContent>
    </Card>
  );
}
