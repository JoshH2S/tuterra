
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CreateStudySessionData } from "@/types/study-sessions";
import { StudentCourse } from "@/types/student";
import { toast } from "@/hooks/use-toast";
import { addDays, addHours, format } from "date-fns";

interface StudySessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession: (sessionData: CreateStudySessionData) => Promise<void>;
  courses: StudentCourse[];
}

export function StudySessionDialog({ 
  open, 
  onOpenChange, 
  onCreateSession, 
  courses 
}: StudySessionDialogProps) {
  const [sessionData, setSessionData] = useState<Partial<CreateStudySessionData>>({
    notify_user: true,
    status: 'scheduled'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default time when dialog opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      const startTime = addHours(now, 1);
      const endTime = addHours(startTime, 1);
      
      setSessionData(prev => ({
        ...prev,
        start_time: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionData.title || !sessionData.start_time || !sessionData.end_time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onCreateSession(sessionData as CreateStudySessionData);
      setSessionData({ 
        notify_user: true,
        status: 'scheduled'
      }); // Reset form after submission
      toast({
        title: "Success",
        description: "Study session scheduled successfully.",
      });
    } catch (error) {
      console.error("Error scheduling session:", error);
      toast({
        title: "Error",
        description: "Failed to schedule study session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Schedule Study Session</h3>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Session Title*</Label>
            <Input 
              id="title"
              value={sessionData.title || ''}
              onChange={(e) => setSessionData({...sessionData, title: e.target.value})}
              placeholder="e.g., Review Chapter 5"
              required
              className="touch-manipulation min-h-[44px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select 
              value={sessionData.course_id} 
              onValueChange={(value) => setSessionData({...sessionData, course_id: value})}
            >
              <SelectTrigger id="course" className="touch-manipulation min-h-[44px]">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.course_id} value={course.course_id}>
                    {course.course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topics">Topics to Study</Label>
            <Textarea 
              id="topics"
              value={sessionData.topics || ''}
              onChange={(e) => setSessionData({...sessionData, topics: e.target.value})}
              placeholder="Enter specific topics you plan to study"
              className="min-h-[60px] touch-manipulation"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time*</Label>
              <Input 
                id="start_time"
                type="datetime-local"
                value={sessionData.start_time || ''}
                onChange={(e) => setSessionData({...sessionData, start_time: e.target.value})}
                required
                className="touch-manipulation min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time*</Label>
              <Input 
                id="end_time"
                type="datetime-local"
                value={sessionData.end_time || ''}
                onChange={(e) => setSessionData({...sessionData, end_time: e.target.value})}
                required
                className="touch-manipulation min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="notify"
              checked={sessionData.notify_user}
              onCheckedChange={(checked) => setSessionData({...sessionData, notify_user: checked})}
              className="touch-manipulation"
            />
            <Label htmlFor="notify" className="cursor-pointer">
              Notify me 1 hour before (email reminder)
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Additional Notes (Optional)</Label>
            <Textarea 
              id="description"
              value={sessionData.description || ''}
              onChange={(e) => setSessionData({...sessionData, description: e.target.value})}
              placeholder="Add any additional details about this session"
              className="min-h-[80px] touch-manipulation"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="touch-manipulation min-h-[44px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="touch-manipulation min-h-[44px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
