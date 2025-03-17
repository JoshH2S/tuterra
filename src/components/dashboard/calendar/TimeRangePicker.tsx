
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function TimeRangePicker({ 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange 
}: TimeRangePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="start_time">Start Time</Label>
        <Input 
          id="start_time"
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end_time">End Time</Label>
        <Input 
          id="end_time"
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
}
