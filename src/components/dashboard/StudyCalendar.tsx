
import { useState } from "react";
import { CalendarView } from "./calendar/CalendarView";
import { SessionsList } from "./calendar/SessionsList";
import { SessionForm } from "./calendar/SessionForm";
import { CreateStudySessionData } from "@/types/study-sessions";
import type { StudySession } from "@/hooks/useStudySessions";
import { useIsMobile } from "@/hooks/use-mobile";
import { PremiumContentCard } from "@/components/ui/premium-card";

interface StudyCalendarProps {
  sessions: StudySession[];
  onCreateSession: (session: CreateStudySessionData) => Promise<void>;
}

export function StudyCalendar({ sessions, onCreateSession }: StudyCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const isMobile = useIsMobile();

  return (
    <PremiumContentCard
      title="Study Schedule"
      headerAction={
        <SessionForm 
          selectedDate={date} 
          onCreateSession={onCreateSession} 
        />
      }
      variant="glass"
    >
      {/* Responsive layout with a single column on mobile and two columns on larger screens */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
        <CalendarView selectedDate={date} onDateSelect={setDate} />
        <SessionsList date={date} sessions={sessions} />
      </div>
    </PremiumContentCard>
  );
}
