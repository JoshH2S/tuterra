
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { useStudentAnalytics } from "@/hooks/useStudentAnalytics";
import { useStudySessions, StudySession } from "@/hooks/useStudySessions";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { StudyCalendar } from "@/components/dashboard/StudyCalendar";
import { NewsFeed } from "@/components/dashboard/NewsFeed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Trophy, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { StrengthsAndAreas } from "@/components/dashboard/StrengthsAndAreas";
import { DesktopDashboard } from "@/components/dashboard/DesktopDashboard";
import { TasksList } from "@/components/dashboard/TasksList";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StudentDashboard() {
  const { courses, performance, isLoading } = useStudentDashboard();
  const { insights } = useStudentAnalytics(courses, performance);
  const { sessions, createSession, isLoading: isLoadingSessions } = useStudySessions();
  const isMobile = useIsMobile();
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionData, setSessionData] = useState<Partial<StudySession>>({});

  if (isLoading || isLoadingSessions) {
    return (
      <div className={`container mx-auto ${isMobile ? 'py-6 px-4' : 'py-12'}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleCreateSession = async (sessionData: Omit<StudySession, 'id' | 'student_id'>) => {
    await createSession(sessionData);
    setSessionDialogOpen(false);
  };

  const openSessionDialog = () => {
    setSessionData({});
    setSessionDialogOpen(true);
  };

  return (
    <div className={`container mx-auto ${isMobile ? 'py-6 px-4' : 'py-12'}`}>
      <div className="mb-6">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold mb-2`}>My Dashboard</h1>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          Track your progress and performance across all your courses
        </p>
      </div>

      {isMobile ? (
        <div className="space-y-6 md:space-y-8">
          <NewsFeed courses={courses} />

          {insights.length > 0 && (
            <div className="grid gap-3">
              {insights.map((insight, index) => {
                const Icon = insight.type === 'warning' 
                  ? AlertTriangle 
                  : insight.type === 'achievement' 
                    ? Trophy 
                    : TrendingUp;

                const bgColor = insight.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : insight.type === 'achievement'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200';

                const textColor = insight.type === 'warning'
                  ? 'text-yellow-600'
                  : insight.type === 'achievement'
                    ? 'text-green-600'
                    : 'text-blue-600';

                return (
                  <Alert key={index} className={`${bgColor} ${isMobile ? 'p-3' : ''}`}>
                    <Icon className={`h-4 w-4 ${textColor}`} />
                    <AlertDescription className={`${textColor} ${isMobile ? 'text-sm' : ''}`}>
                      {insight.message}
                      {insight.metric && ` (${insight.metric.toFixed(1)}${insight.type === 'improvement' ? '%' : ''})`}
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          )}

          <div className="grid gap-6">
            <TasksList 
              sessions={sessions} 
              courses={courses} 
              onCreateSession={openSessionDialog}
            />

            <div className="space-y-6">
              <PerformanceOverview performance={performance} />

              <StudyCalendar 
                sessions={sessions}
                courses={courses}
                onCreateSession={handleCreateSession}
              />
            </div>
          </div>
        </div>
      ) : (
        <DesktopDashboard
          performance={performance}
          insights={insights}
          sessions={sessions}
          courses={courses}
          createSession={handleCreateSession}
        >
          <NewsFeed courses={courses} />
        </DesktopDashboard>
      )}

      {/* Quick Create Study Session Dialog */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <h3 className="text-lg font-semibold mb-4">Schedule Study Session</h3>
          
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            if (sessionData.title && sessionData.course_id && sessionData.start_time && sessionData.end_time) {
              handleCreateSession(sessionData as Omit<StudySession, 'id' | 'student_id'>);
            }
          }}>
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
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input 
                id="description"
                value={sessionData.description || ''}
                onChange={(e) => setSessionData({...sessionData, description: e.target.value})}
                placeholder="Add details about this session"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setSessionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule Session</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
