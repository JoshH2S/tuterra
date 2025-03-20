
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarViewProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  return (
    <div className="rounded-md border p-2 scale-75 origin-center transform w-[133%] -ml-[16%] -mr-[16%]">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="mx-auto w-full scale-75 origin-center transform" /* Added scaling to 75% */
      />
    </div>
  );
}
