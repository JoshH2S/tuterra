
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  label?: string;
}

export function DateSelector({ selectedDate, onDateSelect, label = "Date" }: DateSelectorProps) {
  // Get today's date at the start of the day for date comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
        <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={8}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            initialFocus
            className="border-0"
            fromDate={today} 
            disabled={(date) => date < today}
            captionLayout="dropdown-buttons"
            fromYear={today.getFullYear()}
            toYear={today.getFullYear() + 5}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
