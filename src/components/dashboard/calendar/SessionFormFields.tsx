
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseSelector } from "./CourseSelector";
import { TimeRangePicker } from "./TimeRangePicker";
import { DateSelector } from "./DateSelector";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar-new";
import { Button } from "@/components/ui/button";
import { CreateStudySessionData } from "@/types/study-sessions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CourseOption {
  id: string;
  title: string;
  code?: string;
}

interface SessionFormFieldsProps {
  sessionData: Partial<CreateStudySessionData>;
  setSessionData: (data: Partial<CreateStudySessionData>) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  courses: CourseOption[];
  isLoading: boolean;
}

export function SessionFormFields({
  sessionData,
  setSessionData,
  selectedDate,
  setSelectedDate,
  courses,
  isLoading
}: SessionFormFieldsProps) {
  const isMobile = useIsMobile();
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Study session title"
          value={sessionData.title || ""}
          onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What will you be studying?"
          value={sessionData.description || ""}
          onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      <CourseSelector
        courseId={sessionData.course_id || ""}
        onCourseSelect={(courseId) => setSessionData({ ...sessionData, course_id: courseId })}
        courses={courses}
        isLoading={isLoading}
      />

      {/* Date selection with calendar option */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div className="flex gap-2">
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 pointer-events-auto" 
              align="center"
              side="bottom" 
              sideOffset={4}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
                className={cn("border-0 pointer-events-auto", isMobile ? "scale-90 origin-center" : "")}
                fromDate={new Date()} // Can only select today or future dates
                modifiers={{
                  selected: selectedDate ? [selectedDate] : [],
                }}
                modifiersStyles={{
                  selected: {
                    backgroundColor: "#facc15", // Yellow highlight
                    color: "#000",
                    fontWeight: "bold",
                  }
                }}
                captionLayout="dropdown"
                components={{
                  Dropdown: (props: any) => {
                    return (
                      <Select
                        value={String(props.value)}
                        onValueChange={(value) => {
                          if (props.onChange) {
                            const event = {
                              target: { value: String(value) }
                            } as React.ChangeEvent<HTMLSelectElement>;
                            props.onChange(event);
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
      </div>

      <TimeRangePicker
        startTime={sessionData.start_time || ""}
        endTime={sessionData.end_time || ""}
        onStartTimeChange={(time) => setSessionData({ ...sessionData, start_time: time })}
        onEndTimeChange={(time) => setSessionData({ ...sessionData, end_time: time })}
      />

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="notify_user"
          checked={sessionData.notify_user || false}
          onCheckedChange={(checked) => setSessionData({ ...sessionData, notify_user: checked })}
        />
        <Label htmlFor="notify_user" className="text-sm cursor-pointer">
          Send email reminder one hour before session
        </Label>
      </div>
    </div>
  );
}
