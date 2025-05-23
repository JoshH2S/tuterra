
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InternshipTask } from "./SwipeableInternshipView";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, CheckCircle2 } from "lucide-react";

interface WelcomePanelProps {
  sessionData: InternshipSession;
  tasks: InternshipTask[];
  startDate: string; // Changed from optional to required since we provide a fallback
}

export function WelcomePanel({ sessionData, tasks, startDate }: WelcomePanelProps) {
  // Calculate internship progress percentage
  const calculateProgress = () => {
    // Default to 4 weeks if duration_weeks is not provided
    const durationWeeks = sessionData.duration_weeks || 4;
    const totalDurationMs = durationWeeks * 7 * 24 * 60 * 60 * 1000;
    
    const startDateObj = new Date(startDate);
    const currentDate = new Date();
    const elapsedMs = currentDate.getTime() - startDateObj.getTime();
    
    // Cap progress at 100%
    let progressPercentage = Math.min((elapsedMs / totalDurationMs) * 100, 100);
    
    // Ensure progress is at least 1% if internship has started
    if (currentDate > startDateObj && progressPercentage < 1) {
      progressPercentage = 1;
    }
    
    // Ensure progress is non-negative
    return Math.max(0, Math.round(progressPercentage));
  };
  
  // Count completed tasks
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const totalTasks = tasks.length;
  const taskCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-xl">Welcome to your Virtual Internship</CardTitle>
          <CardDescription>
            {sessionData.job_title} in {sessionData.industry}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Internship Progress</span>
            <span>{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col p-3 border rounded-md bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Start Date</span>
            </div>
            <span className="text-sm text-muted-foreground">{formatDate(startDate)}</span>
          </div>
          
          <div className="flex flex-col p-3 border rounded-md bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Task Completion</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedTasks} of {totalTasks} tasks ({taskCompletion}%)
            </span>
          </div>
        </div>

        {sessionData.job_description && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Position Overview</h3>
            <p className="text-sm text-muted-foreground">
              {sessionData.job_description.length > 150
                ? `${sessionData.job_description.substring(0, 150)}...`
                : sessionData.job_description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
