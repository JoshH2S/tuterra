import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InternshipTask } from "@/types/internship";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { differenceInDays, format, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { DownloadIcon, TrendingUpIcon, ClockIcon, CheckCircleIcon, Target } from 'lucide-react';
import { LoadingSpinner } from "@/components/ui/loading-states";

interface MetricsDashboardProps {
  sessionId: string;
  tasks: InternshipTask[];
}

interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  avgCompletionTime: number; // in days
  completionRate: number; // percentage
}

interface TimeSpentData {
  week: string;
  hours: number;
}

interface AchievementData {
  name: string;
  count: number;
}

export function InternshipMetricsDashboard({ sessionId, tasks }: MetricsDashboardProps) {
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [timeSpentData, setTimeSpentData] = useState<TimeSpentData[]>([]);
  const [achievementData, setAchievementData] = useState<AchievementData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // Calculate task analytics
  useEffect(() => {
    if (!tasks.length) return;
    
    const completed = tasks.filter(task => task.status === 'completed');
    const overdue = tasks.filter(task => task.status === 'overdue');
    const inProgress = tasks.filter(task => task.status === 'in_progress');
    
    // Calculate average completion time
    let totalCompletionDays = 0;
    
    completed.forEach(task => {
      if (task.submission) {
        const assignedDate = new Date(task.created_at);
        const completedDate = new Date(task.submission.created_at);
        totalCompletionDays += differenceInDays(completedDate, assignedDate);
      }
    });
    
    const avgDays = completed.length > 0 ? totalCompletionDays / completed.length : 0;
    
    setAnalytics({
      totalTasks: tasks.length,
      completedTasks: completed.length,
      overdueTasks: overdue.length,
      inProgressTasks: inProgress.length,
      avgCompletionTime: Math.round(avgDays * 10) / 10,
      completionRate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0
    });
  }, [tasks]);
  
  // Fetch time spent data
  useEffect(() => {
    async function fetchTimeData() {
      try {
        // This would be replaced with real tracking data in a production app
        // For now, generate sample data based on task submissions
        const { data: submissions, error } = await supabase
          .from('internship_task_submissions')
          .select('created_at')
          .eq('session_id', sessionId)
          .order('created_at');
          
        if (error) throw error;
        
        // Group submissions by week
        const weekMap = new Map<string, number>();
        
        submissions?.forEach(sub => {
          const date = parseISO(sub.created_at);
          const weekKey = format(date, 'MMM d');
          
          // Assume each submission took 2-5 hours (random for demo)
          const hours = Math.floor(Math.random() * 3) + 2;
          
          if (weekMap.has(weekKey)) {
            weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + hours);
          } else {
            weekMap.set(weekKey, hours);
          }
        });
        
        // Convert to array for chart
        const timeData = Array.from(weekMap.entries()).map(([week, hours]) => ({
          week,
          hours
        }));
        
        setTimeSpentData(timeData);
      } catch (error) {
        console.error('Error fetching time data:', error);
      }
    }
    
    // Fetch achievements data
    async function fetchAchievements() {
      try {
        // In a real app, fetch actual achievements
        // For now, use mock data
        setAchievementData([
          { name: 'Tasks Completed', count: tasks.filter(t => t.status === 'completed').length },
          { name: 'On-Time Submissions', count: tasks.filter(t => t.status === 'completed' && t.submission).length },
          { name: 'Feedback Received', count: tasks.filter(t => t.submission?.feedback_text).length },
          { name: 'High Ratings', count: tasks.filter(t => t.submission?.quality_rating && t.submission.quality_rating > 8).length }
        ]);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    }
    
    setLoading(true);
    Promise.all([fetchTimeData(), fetchAchievements()])
      .finally(() => setLoading(false));
      
  }, [sessionId, tasks]);

  const downloadReport = () => {
    // In a real app, this would generate a PDF or CSV
    alert('Report download functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Internship Analytics</h2>
        <Button onClick={downloadReport} className="gap-2">
          <DownloadIcon className="h-4 w-4" />
          Download Report
        </Button>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Task Completion</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {analytics?.completionRate.toFixed(0)}%
              <TrendingUpIcon className="h-5 w-5 ml-2 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {analytics?.completedTasks} of {analytics?.totalTasks} tasks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Completion Time</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {analytics?.avgCompletionTime} days
              <ClockIcon className="h-5 w-5 ml-2 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Per task on average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasks In Progress</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {analytics?.inProgressTasks}
              <Target className="h-5 w-5 ml-2 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue Tasks</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              {analytics?.overdueTasks}
              {analytics?.overdueTasks === 0 ? (
                <CheckCircleIcon className="h-5 w-5 ml-2 text-green-500" />
              ) : (
                <ClockIcon className="h-5 w-5 ml-2 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {analytics?.overdueTasks === 0 ? 'All tasks on schedule' : 'Need attention'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Time Spent per Week</CardTitle>
            <CardDescription>Hours dedicated to internship tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeSpentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" angle={-45} textAnchor="end" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Achievement Breakdown</CardTitle>
            <CardDescription>Key milestones in your internship</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={achievementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {achievementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 