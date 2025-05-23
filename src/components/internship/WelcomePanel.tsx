
import { ModernCard } from "@/components/ui/modern-card";
import { Progress } from "@/components/ui/progress";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { InternshipTask } from "./SwipeableInternshipView";
import { useAuth } from "@/hooks/useAuth";
import { differenceInDays } from "date-fns";

interface WelcomePanelProps {
  sessionData: InternshipSession;
  tasks: InternshipTask[];
  startDate: string;
}

export function WelcomePanel({ sessionData, tasks, startDate }: WelcomePanelProps) {
  const { user } = useAuth();
  
  // Calculate progress based on completed tasks and time elapsed
  const calculateProgressPercentage = (): number => {
    if (!tasks.length) return 0;
    
    // Method 1: Based on completed tasks
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const taskProgress = (completedTasks / tasks.length) * 100;
    
    // Method 2: Based on time elapsed (from start_date to duration_weeks)
    const start = new Date(startDate);
    const now = new Date();
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + (sessionData.duration_weeks * 7));
    
    let timeProgress = 0;
    if (now >= endDate) {
      timeProgress = 100;
    } else if (now <= start) {
      timeProgress = 0;
    } else {
      const totalDuration = differenceInDays(endDate, start);
      const elapsed = differenceInDays(now, start);
      timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }
    
    // Combined progress (weight tasks more heavily)
    return Math.round((taskProgress * 0.7) + (timeProgress * 0.3));
  };

  const progressPercentage = calculateProgressPercentage();
  const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
  const totalTasksCount = tasks.length;

  return (
    <ModernCard>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">
          Welcome{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}!
        </h2>
        <p className="text-muted-foreground mb-5">
          Your {sessionData.job_title} internship at {sessionData.industry} is in progress
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Internship Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-primary/10 rounded-lg p-3 flex-1">
              <div className="text-sm text-muted-foreground">Completed Tasks</div>
              <div className="text-xl font-bold">{completedTasksCount} of {totalTasksCount}</div>
            </div>
            <div className="bg-primary/10 rounded-lg p-3 flex-1">
              <div className="text-sm text-muted-foreground">Week</div>
              <div className="text-xl font-bold">
                {Math.min(
                  sessionData.duration_weeks,
                  Math.max(1, Math.ceil(differenceInDays(new Date(), new Date(startDate)) / 7))
                )} of {sessionData.duration_weeks}
              </div>
            </div>
          </div>
          
          {sessionData.duration_weeks && tasks.length > 0 && (
            <div className="flex flex-col border rounded-lg">
              <div className="p-3 bg-muted/20 border-b">
                <h3 className="text-sm font-medium">Up Next</h3>
              </div>
              <div className="p-3">
                {/* Show first incomplete task */}
                {tasks.find(task => task.status !== 'completed') ? (
                  <div>
                    <p className="font-medium">
                      {tasks.find(task => task.status !== 'completed')?.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {tasks.find(task => task.status !== 'completed')?.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Great job! You've completed all the tasks.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  );
}
