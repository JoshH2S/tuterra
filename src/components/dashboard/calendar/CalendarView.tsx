
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar-new";
import { DropdownProps } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface CalendarViewProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const isMobile = useIsMobile();
  
  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>,
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    _e(_event);
  };

  return (
    <div className="rounded-md border p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className={`mx-auto w-full ${isMobile ? "scale-90 origin-center transform" : ""}`}
        classNames={{
          month: "w-full",
        }}
        captionLayout="dropdown"
        showNavigation={false}
        components={{
          Dropdown: (props: DropdownProps) => {
            return (
              <Select
                value={String(props.value)}
                onValueChange={(value) => {
                  if (props.onChange) {
                    handleCalendarChange(value, props.onChange);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-fit font-medium first:grow">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                  {props.children && Array.isArray(props.children) && props.children.map((option: any) => (
                    <SelectItem
                      key={option.props.value}
                      value={String(option.props.value)}
                      disabled={option.props.disabled}
                    >
                      {option.props.children}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          },
        }}
      />
    </div>
  );
}
