
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateStudySessionData } from "@/types/study-sessions";
import { useCourses } from "@/hooks/useCourses";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession: (sessionData: CreateStudySessionData) => Promise<void>;
}

export function StudySessionDialog({ 
  open, 
  onOpenChange, 
  onCreateSession
}: StudySessionDialogProps) {
  const [sessionData, setSessionData] = useState<Partial<CreateStudySessionData>>({});
  const { courses, isLoading } = useCourses();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  console.log("Courses fetched in StudySessionDialog:", courses); // Debug logging
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select a date for your study session",
        variant: "destructive"
      });
      return;
    }
    
    if (sessionData.title && sessionData.course_id && sessionData.start_time && sessionData.end_time) {
      // Combine the date with the time
      const [startHour, startMinute] = sessionData.start_time.split(':');
      const [endHour, endMinute] = sessionData.end_time.split(':');
      
      const startDate = new Date(selectedDate);
      startDate.setHours(parseInt(startHour), parseInt(startMinute));
      
      const endDate = new Date(selectedDate);
      endDate.setHours(parseInt(endHour), parseInt(endMinute));
      
      onCreateSession({
        title: sessionData.title,
        description: sessionData.description || null,
        course_id: sessionData.course_id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled'
      });
      setSessionData({}); // Reset form after submission
      setSelectedDate(new Date()); // Reset date to current date
    } else {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };

  // Get today's date at the start of the day for date comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto py-6">
        <h3 className="text-lg font-semibold mb-6">Schedule Study Session</h3>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input 
              id="title"
              value={sessionData.title || ''}
              onChange={(e) => setSessionData({...sessionData, title: e.target.value})}
              placeholder="e.g., Review Chapter 5"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select 
              value={sessionData.course_id} 
              onValueChange={(value) => setSessionData({...sessionData, course_id: value})}
              disabled={isLoading}
            >
              <SelectTrigger id="course">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses && courses.length > 0 ? (
                  courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-courses" disabled>
                    No courses available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Picker with improved layout */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="p-3"
                  fromDate={today} 
                  disabled={(date) => date < today}
                  captionLayout="dropdown-buttons"
                  fromYear={today.getFullYear()}
                  toYear={today.getFullYear() + 5}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input 
                id="start_time"
                type="time"
                value={sessionData.start_time || ''}
                onChange={(e) => setSessionData({...sessionData, start_time: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input 
                id="end_time"
                type="time"
                value={sessionData.end_time || ''}
                onChange={(e) => setSessionData({...sessionData, end_time: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input 
              id="description"
              value={sessionData.description || ''}
              onChange={(e) => setSessionData({...sessionData, description: e.target.value})}
              placeholder="Add details about this session"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule Session</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
