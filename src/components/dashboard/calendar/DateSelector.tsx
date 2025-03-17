
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
        <PopoverContent 
          className="w-auto p-0" 
          align="center"
          side="bottom" 
          sideOffset={4}
          alignOffset={0}
          avoidCollisions={true}
          collisionPadding={30}
          forceMount
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            initialFocus
            className="border-0 scale-75 origin-center transform w-[133%] h-[133%] -m-4" // Scale to 3/4 size and adjust width/height to maintain proper layout
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
