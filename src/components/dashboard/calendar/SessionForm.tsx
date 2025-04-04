
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateStudySessionData } from "@/types/study-sessions";
import { useCourses } from "@/hooks/useCourses";

interface SessionFormProps {
  selectedDate: Date | undefined;
  onCreateSession: (session: CreateStudySessionData) => Promise<void>;
}

export function SessionForm({ selectedDate, onCreateSession }: SessionFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { courses, isLoading } = useCourses();
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    course_id: "",
    start_time: "",
    end_time: "",
    notify_user: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const [startHour, startMinute] = newSession.start_time.split(':');
    const [endHour, endMinute] = newSession.end_time.split(':');

    const startDate = new Date(selectedDate);
    startDate.setHours(parseInt(startHour), parseInt(startMinute));

    const endDate = new Date(selectedDate);
    endDate.setHours(parseInt(endHour), parseInt(endMinute));

    await onCreateSession({
      title: newSession.title,
      description: newSession.description || null,
      course_id: newSession.course_id || null,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'scheduled',
      notify_user: newSession.notify_user
    });

    setIsDialogOpen(false);
    setNewSession({
      title: "",
      description: "",
      course_id: "",
      start_time: "",
      end_time: "",
      notify_user: true
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Schedule Study Session</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule New Study Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newSession.title}
              onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newSession.description}
              onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="course">Course</Label>
            <Select
              value={newSession.course_id}
              onValueChange={(value) => setNewSession(prev => ({ ...prev, course_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={newSession.start_time}
                onChange={(e) => setNewSession(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={newSession.end_time}
                onChange={(e) => setNewSession(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="notify_user"
              checked={newSession.notify_user}
              onCheckedChange={(checked) => setNewSession(prev => ({ ...prev, notify_user: checked }))}
            />
            <Label htmlFor="notify_user" className="text-sm">
              Send email reminder one hour before session
            </Label>
          </div>

          <Button type="submit" className="w-full">Schedule Session</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
