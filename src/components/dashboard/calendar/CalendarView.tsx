
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

interface CalendarViewProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  return (
    <div className="rounded-md border p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="mx-auto w-full" /* Made width full and centered */
      />
    </div>
  );
}
