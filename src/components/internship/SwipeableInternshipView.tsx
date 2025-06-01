import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, BarChart2, Briefcase, FileCheck, Calendar, MessageSquare, ExternalLink, Award, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { InternshipSession, InternshipTask as DashboardInternshipTask } from "@/pages/VirtualInternshipDashboard";
import { WelcomePanel } from "./WelcomePanel";
import { TaskOverview } from "./TaskOverview";
import { CalendarView } from "./CalendarView";
import { MessagingPanel } from "./MessagingPanel";
import { ResourceHub } from "./ResourceHub";
import { FeedbackCenter } from "./FeedbackCenter";
import { GamificationPanel } from "./GamificationPanel";
import { MobileInternshipHeader } from "./MobileInternshipHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternshipMetricsDashboard } from "./InternshipMetricsDashboard";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Task submission interface
export interface TaskSubmission {
  id: string;
  response_text: string;
  created_at: string;
  feedback_text?: string | null;
  feedback_provided_at?: string | null;
  quality_rating?: number | null;
  timeliness_rating?: number | null;
  collaboration_rating?: number | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  content_type?: 'text' | 'file' | 'both' | null;
}

// Use the same task interface as in the dashboard
export type InternshipTask = DashboardInternshipTask;

export type InternshipEvent = {
  id: string;
  session_id: string;
  title: string;
  date: string;
  type: "meeting" | "deadline" | "milestone";
};

export interface InternshipResource {
  id: string;
  session_id: string;
  title: string;
  type: string;
  description?: string;
  content?: string;
  link: string;
}

export interface InternshipSession {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  created_at: string;
  duration_weeks: number;
  status: string;
}

export interface InternshipTask {
  id: string;
  session_id: string;
  title: string;
  description: string;
  instructions?: string | null;
  due_date: string;
  status: string;
  task_type?: string | null;
  visible_after?: string;
}

interface SwipeableInternshipViewProps {
  sessionData: InternshipSession;
  onOpenTaskDetails?: (task: InternshipTask) => void;
}

export function SwipeableInternshipView({ sessionData, onOpenTaskDetails }: SwipeableInternshipViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<InternshipTask[]>([]);
  const [visibleTasks, setVisibleTasks] = useState<InternshipTask[]>([]);
  const [events, setEvents] = useState<InternshipEvent[]>([]);
  const [resources, setResources] = useState<InternshipResource[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    "Overview", 
    "Tasks", 
    "Calendar", 
    "Messages", 
    "Resources", 
    "Feedback", 
    "Achievements",
    "Metrics"
  ];
  
  // Define the start date, defaulting to created_at if not available
  const startDate = sessionData.start_date || sessionData.created_at;

  useEffect(() => {
    const fetchInternshipData = async () => {
      setLoading(true);
      try {
        // Fetch tasks
        const { data: taskData, error: taskError } = await supabase
          .from("internship_tasks")
          .select("*")
          .eq("session_id", sessionData.id)
          .order("task_order");
          
        if (taskError) throw taskError;
        
        // Check for overdue tasks and filter by visibility
        const now = new Date();
        const allTasks = (taskData || []).map(task => {
          const dueDate = new Date(task.due_date);
          let status = task.status as InternshipTask["status"]; // Cast to the correct type
          
          if (status !== 'completed' && dueDate < now) {
            status = 'overdue';
          }
          
          return {
            ...task,
            status
          } as InternshipTask;
        });
        
        // Filter tasks that are visible now
        const visibleTasksFiltered = allTasks.filter(task => {
          return !task.visible_after || new Date(task.visible_after) <= now;
        });
        
        setTasks(allTasks);
        setVisibleTasks(visibleTasksFiltered);
        
        // Fetch events
        const { data: eventData, error: eventError } = await supabase
          .from("internship_events")
          .select("*")
          .eq("session_id", sessionData.id);
        
        if (eventError) throw eventError;
        setEvents((eventData || []) as InternshipEvent[]);
        
        // Fetch resources
        const { data: resourceData, error: resourceError } = await supabase
          .from("internship_resources")
          .select("*")
          .eq("session_id", sessionData.id);
        
        if (resourceError) throw resourceError;
        setResources(resourceData || []);
        
      } catch (error) {
        console.error("Error fetching internship data:", error);
        toast({
          title: "Error loading internship data",
          description: "There was an issue loading your internship details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionData?.id) {
      fetchInternshipData();
    }
  }, [sessionData, toast]);

  const updateTaskStatus = async (taskId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    try {
      // Update the task status in the database
      const { error } = await supabase
        .from("internship_tasks")
        .update({ status })
        .eq("id", taskId);
        
      if (error) throw error;
      
      // Update the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
      
      // Show success message
      toast({
        title: status === 'completed' ? "Task completed!" : "Task status updated",
        description: status === 'completed' 
          ? "Great job! Your progress has been saved." 
          : "Your task status has been updated successfully.",
        variant: "default",
      });
      
      // If task was marked as completed, you might trigger feedback generation here
      // via an edge function or other business logic
      
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error updating task",
        description: "There was an issue updating the task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setActiveIndex(i => Math.max(0, i - 1));
  };
  
  const handleNext = () => {
    setActiveIndex(i => Math.min(tabs.length - 1, i + 1));
  };
  
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    switch (activeIndex) {
      case 0: // Overview
        return <WelcomePanel sessionData={sessionData} tasks={visibleTasks} startDate={startDate} events={events} onOpenTaskDetails={onOpenTaskDetails} />;
      case 1: // Tasks
        return <TaskOverview tasks={visibleTasks} updateTaskStatus={updateTaskStatus} allTasks={tasks} />;
      case 2: // Calendar
        return <CalendarView events={events} tasks={visibleTasks} sessionId={sessionData.id} updateTaskStatus={updateTaskStatus} />;
      case 3: // Messages
        return <MessagingPanel sessionId={sessionData.id} />;
      case 4: // Resources
        return <ResourceHub resources={resources} sessionId={sessionData.id} />;
      case 5: // Feedback
        return <FeedbackCenter sessionData={sessionData} tasks={visibleTasks} />;
      case 6: // Achievements
        return <GamificationPanel sessionData={sessionData} tasks={visibleTasks} />;
      case 7: // Metrics - New tab
        return <InternshipMetricsDashboard sessionId={sessionData.id} tasks={visibleTasks} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  if (isMobile) {
    // Mobile version remains the same with improved tab navigation
    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Title card */}
        <Card className="shadow-sm bg-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                {sessionData.job_title}
              </h2>
              <Badge variant="outline" className="text-xs h-5 px-1.5 font-normal">
                {sessionData.industry}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Horizontal tabbed navigation */}
        <div className="relative border rounded-md overflow-hidden shadow-sm bg-white">
          <Tabs value={tabs[activeIndex].toLowerCase()}>
            <div className="overflow-x-auto scrollbar-none">
              <TabsList className="w-max flex rounded-none bg-muted/40">
                {tabs.map((tab, index) => (
                  <TabsTrigger
                    key={tab}
                    className="min-w-[5rem] data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
                    onClick={() => setActiveIndex(index)}
                    value={tab.toLowerCase()}
                  >
                    <span className="flex items-center gap-1">
                      {getTabIcon(index)}
                      <span className="whitespace-nowrap text-xs">{tab}</span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>
        
        {/* Main content */}
        <Card className="flex-1 shadow-sm bg-white">
          <CardContent className="p-3 md:p-4 h-full overflow-auto">
            {renderTabContent()}
          </CardContent>
        </Card>
        
        {/* Navigation controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={activeIndex === 0}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-xs">Previous</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={activeIndex === tabs.length - 1}
            className="h-8 px-2"
          >
            <span className="text-xs">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // Desktop version with horizontal tabs
  return (
    <div className="w-full">
      <Card className="shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={tabs[activeIndex].toLowerCase()} className="w-full">
            <div className="border-b">
              <TabsList className="w-full flex justify-start p-0 bg-transparent rounded-none">
                {tabs.map((tab, index) => (
                  <TabsTrigger
                    key={tab}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm rounded-none border-b-2 transition-all
                      data-[state=active]:border-b-primary data-[state=active]:text-primary font-medium
                      data-[state=inactive]:border-b-transparent data-[state=inactive]:hover:bg-muted/20
                    `}
                    onClick={() => setActiveIndex(index)}
                    value={tab.toLowerCase()}
                  >
                    {getTabIcon(index)}
                    <span>{tab}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <div className="p-4">
              {renderTabContent()}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Add helper function to get icons for tabs at the bottom of the file
function getTabIcon(index: number) {
  switch (index) {
    case 0: // Overview
      return <Briefcase className="h-4 w-4" />;
    case 1: // Tasks
      return <FileCheck className="h-4 w-4" />;
    case 2: // Calendar
      return <Calendar className="h-4 w-4" />;
    case 3: // Messages
      return <MessageSquare className="h-4 w-4" />;
    case 4: // Resources
      return <ExternalLink className="h-4 w-4" />;
    case 5: // Feedback
      return <MessageSquare className="h-4 w-4" />;
    case 6: // Achievements
      return <Award className="h-4 w-4" />;
    case 7: // Metrics
      return <BarChart2 className="h-4 w-4" />;
    default:
      return <Briefcase className="h-4 w-4" />;
  }
}
