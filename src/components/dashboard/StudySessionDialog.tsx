
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CreateStudySessionData } from "@/types/study-sessions";
import { StudentCourse } from "@/types/student";

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
    notify_user: false,
    status: 'scheduled'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionData.title && sessionData.course_id && sessionData.start_time && sessionData.end_time) {
      onCreateSession(sessionData as CreateStudySessionData);
      setSessionData({ 
        notify_user: false,
        status: 'scheduled'
      }); // Reset form after submission
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <h3 className="text-lg font-semibold mb-4">Schedule Study Session</h3>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            >
              <SelectTrigger id="course">
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
              className="min-h-[60px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input 
                id="start_time"
                type="datetime-local"
                value={sessionData.start_time || ''}
                onChange={(e) => setSessionData({...sessionData, start_time: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input 
                id="end_time"
                type="datetime-local"
                value={sessionData.end_time || ''}
                onChange={(e) => setSessionData({...sessionData, end_time: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="notify"
              checked={sessionData.notify_user}
              onCheckedChange={(checked) => setSessionData({...sessionData, notify_user: checked})}
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
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
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
