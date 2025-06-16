import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Check, ArrowRight, Calendar, Award, Briefcase, FileCheck, AlertCircle, ChevronRight } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { InternshipTask } from "@/types/internship";
import { formatInUserTimezone } from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { InternshipProgressRadials } from "./InternshipProgressRadials";
import { TaskOverview } from "./TaskOverview";
import { supabase } from "@/integrations/supabase/client";

interface DashboardOverviewPanelProps {
  sessionData: {
    id: string;
    job_title: string;
    industry: string;
    job_description?: string;
    current_phase?: number;
    created_at: string;
    start_date: string;
  };
  tasks: InternshipTask[];
  startDate: string;
  onOpenTaskDetails: (task: InternshipTask) => void;
}

export function DashboardOverviewPanel({ 
  sessionData, 
  tasks, 
  startDate, 
  onOpenTaskDetails 
}: DashboardOverviewPanelProps) {
  const [averageScore, setAverageScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch average score
  useEffect(() => {
    const fetchAverageScore = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('internship_task_submissions')
          .select('quality_rating')
          .eq('session_id', sessionData.id)
          .not('quality_rating', 'is', null);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + (curr.quality_rating || 0), 0);
          const avg = sum / data.length;
          setAverageScore(avg);
        }
      } catch (error) {
        console.error('Error fetching average score:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAverageScore();
  }, [sessionData.id]);

  // Calculate how many days have passed since the start date
  const startDateObj = new Date(startDate);
  const today = new Date();
  const daysSinceStart = differenceInDays(today, startDateObj);
  
  // Calculate progress metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const overdueTasks = tasks.filter(task => task.status === 'overdue').length;
  const pendingTasks = tasks.filter(task => task.status === 'not_started').length;
  
  // Get upcoming tasks (sorted by due date)
  const upcomingTasks = [...tasks]
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
  // Empty update task function that returns a Promise
  const handleUpdateTaskStatus = async (taskId: string, status: 'not_started' | 'in_progress' | 'completed'): Promise<void> => {
    return Promise.resolve();
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Welcome back!</CardTitle>
              <CardDescription>
                {sessionData.job_title} • {sessionData.industry}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/10 border-primary/25 text-primary">
              Day {daysSinceStart + 1}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Started on</h3>
                <p className="text-sm text-muted-foreground">
                  {formatInUserTimezone(startDate, "MMMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Radials */}
      <InternshipProgressRadials 
        completedTasks={completedTasks} 
        totalTasks={totalTasks} 
        averageScore={averageScore} 
      />

      {/* Task Status Summary */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Task Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Check className="h-4 w-4 text-green-500" />
                <h3 className="text-sm font-medium">Completed</h3>
              </div>
              <p className="text-2xl font-bold">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">of {totalTasks} tasks</p>
            </div>
            
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-medium">In Progress</h3>
              </div>
              <p className="text-2xl font-bold">{inProgressTasks}</p>
              <p className="text-xs text-muted-foreground">tasks being worked on</p>
            </div>
            
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-medium">Overdue</h3>
              </div>
              <p className="text-2xl font-bold">{overdueTasks}</p>
              <p className="text-xs text-muted-foreground">need attention</p>
            </div>
            
            <div className="p-3 border rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-medium">Pending</h3>
              </div>
              <p className="text-2xl font-bold">{pendingTasks}</p>
              <p className="text-xs text-muted-foreground">not started yet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Tasks Section */}
      <Card className="bg-white">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Current Tasks
          </CardTitle>
          {tasks.length > 2 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-sm"
              onClick={() => onOpenTaskDetails(upcomingTasks[0])}
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <TaskOverview 
            tasks={tasks} 
            onUpdateTaskStatus={handleUpdateTaskStatus} 
            onOpenTaskDetails={onOpenTaskDetails} 
            compact={true} 
            allTasks={tasks}
            maxDisplayCount={3}
          />
        </CardContent>
      </Card>
    </div>
  );
} 