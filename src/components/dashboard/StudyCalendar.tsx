
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Clock, CalendarDays, GraduationCap } from "lucide-react";
import { CreateStudySessionData } from "@/types/study-sessions";
import type { StudySession } from "@/hooks/useStudySessions";
import type { StudentCourse } from "@/types/student";

interface StudyCalendarProps {
  sessions: StudySession[];
  courses: StudentCourse[];
  onCreateSession: (session: CreateStudySessionData) => Promise<void>;
}

export function StudyCalendar({ sessions, courses, onCreateSession }: StudyCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    course_id: "",
    start_time: "",
    end_time: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const [startHour, startMinute] = newSession.start_time.split(':');
    const [endHour, endMinute] = newSession.end_time.split(':');

    const startDate = new Date(date);
    startDate.setHours(parseInt(startHour), parseInt(startMinute));

    const endDate = new Date(date);
    endDate.setHours(parseInt(endHour), parseInt(endMinute));

    await onCreateSession({
      title: newSession.title,
      description: newSession.description || null,
      course_id: newSession.course_id || null,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: 'scheduled',
    });

    setIsDialogOpen(false);
    setNewSession({
      title: "",
      description: "",
      course_id: "",
      start_time: "",
      end_time: "",
    });
  };

  const sessionsForDate = sessions.filter(session => {
    const sessionDate = new Date(session.start_time);
    return date && 
      sessionDate.getDate() === date.getDate() &&
      sessionDate.getMonth() === date.getMonth() &&
      sessionDate.getFullYear() === date.getFullYear();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Study Schedule</h2>
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
                      <SelectItem key={course.course_id} value={course.course_id}>
                        {course.course.title}
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
              <Button type="submit" className="w-full">Schedule Session</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modified grid layout to ensure better spacing for mobile */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-md border p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="mx-auto w-full" /* Made width full and centered */
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Sessions for {date ? format(date, 'MMMM d, yyyy') : 'Selected Date'}
          </h3>
          {sessionsForDate.length === 0 ? (
            <p className="text-muted-foreground">No study sessions scheduled for this date.</p>
          ) : (
            <div className="space-y-3">
              {sessionsForDate.map((session) => {
                const startTime = new Date(session.start_time);
                const endTime = new Date(session.end_time);
                const course = courses.find(c => c.course_id === session.course_id);

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <div className="font-medium">{session.title}</div>
                    {session.description && (
                      <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                      </div>
                      {course && (
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {course.course.title}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
