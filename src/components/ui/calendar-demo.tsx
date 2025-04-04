
"use client";

import { useState } from "react";
import { DropdownProps } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar-new";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());

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
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg border border-border p-2 bg-background pointer-events-auto"
        captionLayout="dropdown"
        defaultMonth={new Date()}
        modifiers={{
          selected: date ? [date] : [],
        }}
        modifiersStyles={{
          selected: {
            backgroundColor: "#facc15", // Yellow highlight
            color: "#000",
            fontWeight: "bold",
          }
        }}
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
      <p
        className="mt-4 text-center text-xs text-muted-foreground"
        role="region"
        aria-live="polite"
      >
        Monthly / yearly selects -{" "}
        <a
          className="underline hover:text-foreground"
          href="https://daypicker.dev/"
          target="_blank"
          rel="noopener nofollow"
        >
          React DayPicker
        </a>
      </p>
    </div>
  );
}
