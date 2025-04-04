
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar-new";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { DropdownProps } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  label?: string;
}

export function DateSelector({ selectedDate, onDateSelect, label = "Date" }: DateSelectorProps) {
  // Get today's date at the start of the day for date comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
    <div className="space-y-2">
      <Label htmlFor="date">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 pointer-events-auto" 
          align="center"
          side="bottom" 
          sideOffset={4}
          alignOffset={0}
          avoidCollisions={true}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            initialFocus
            className="border-0"
            fromDate={today} 
            disabled={(date) => date < today}
            showNavigation={false}
            captionLayout="dropdown"
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
