import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { WelcomePanel } from "./WelcomePanel";
import { TaskOverview } from "./TaskOverview";
import { CalendarView } from "./CalendarView";
import { MessagingPanel } from "./MessagingPanel";
import { ResourceHub } from "./ResourceHub";
import { FeedbackCenter } from "./FeedbackCenter";
import { GamificationPanel } from "./GamificationPanel";
import { ExitActions } from "./ExitActions";
import { MobileInternshipHeader } from "./MobileInternshipHeader";
import { Tab } from "@/components/ui/tabs";

export type InternshipTask = {
  id: string;
  session_id: string;
  title: string;
  description: string;
  instructions?: string | null;
  task_order: number;
  due_date: string;
  status: "not_started" | "in_progress" | "completed" | "overdue";
  task_type?: string | null;
  created_at: string;
};

export type InternshipEvent = {
  id: string;
  session_id: string;
  title: string;
  date: string;
  type: "meeting" | "deadline" | "milestone";
};

export interface InternshipMessage {
  id: string;
  session_id: string;
  sender: string;
  subject: string;
  content: string;
  sent_at: string;
}

export interface InternshipResource {
  id: string;
  session_id: string;
  title: string;
  type: string;
  link: string;
}

interface SwipeableInternshipViewProps {
  sessionData: InternshipSession;
}

export function SwipeableInternshipView({ sessionData }: SwipeableInternshipViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<InternshipTask[]>([]);
  const [events, setEvents] = useState<InternshipEvent[]>([]);
  const [messages, setMessages] = useState<InternshipMessage[]>([]);
  const [resources, setResources] = useState<InternshipResource[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    "Overview", 
    "Tasks", 
    "Calendar", 
    "Messages", 
    "Resources", 
    "Feedback", 
    "Achievements"
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
        
        // Check for overdue tasks
        const now = new Date();
        const tasksWithOverdueStatus = (taskData || []).map(task => {
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
        
        setTasks(tasksWithOverdueStatus);
        
        // Fetch events
        const { data: eventData, error: eventError } = await supabase
          .from("internship_events")
          .select("*")
          .eq("session_id", sessionData.id);
        
        if (eventError) throw eventError;
        setEvents((eventData || []) as InternshipEvent[]);
        
        // Fetch messages
        const { data: messageData, error: messageError } = await supabase
          .from("internship_messages")
          .select("*")
          .eq("session_id", sessionData.id)
          .order("sent_at", { ascending: false });
        
        if (messageError) throw messageError;
        setMessages(messageData || []);
        
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
        return <WelcomePanel sessionData={sessionData} tasks={tasks} startDate={startDate} />;
      case 1: // Tasks
        return <TaskOverview tasks={tasks} updateTaskStatus={updateTaskStatus} />;
      case 2: // Calendar
        return <CalendarView events={events} tasks={tasks} />;
      case 3: // Messages
        return <MessagingPanel messages={messages} />;
      case 4: // Resources
        return <ResourceHub resources={resources} />;
      case 5: // Feedback
        return <FeedbackCenter sessionData={sessionData} />;
      case 6: // Achievements
        return <GamificationPanel sessionData={sessionData} tasks={tasks} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <MobileInternshipHeader 
          jobTitle={sessionData.job_title}
          industry={sessionData.industry}
        />
        
        <div className="overflow-x-auto mt-2">
          <div className="flex space-x-2 px-4">
            {tabs.map((tab, index) => (
              <Tab
                key={tab}
                className={`px-3 py-2 whitespace-nowrap ${
                  activeIndex === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
                onClick={() => setActiveIndex(index)}
              >
                {tab}
              </Tab>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {renderTabContent()}
        </div>
        
        <div className="flex justify-between p-4 bg-background sticky bottom-0 border-t">
          <button
            onClick={handlePrevious}
            className="flex items-center justify-center p-2"
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="ml-1">{activeIndex > 0 ? tabs[activeIndex - 1] : ""}</span>
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center justify-center p-2"
            disabled={activeIndex === tabs.length - 1}
          >
            <span className="mr-1">{activeIndex < tabs.length - 1 ? tabs[activeIndex + 1] : ""}</span>
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 border-t">
          <ExitActions sessionId={sessionData.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <div className="space-y-2 sticky top-4">
          {tabs.map((tab, index) => (
            <Tab
              key={tab}
              className={`w-full p-3 ${
                activeIndex === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
              onClick={() => setActiveIndex(index)}
            >
              {tab}
            </Tab>
          ))}
          
          <div className="mt-4">
            <ExitActions sessionId={sessionData.id} />
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2 lg:col-span-3">
        {renderTabContent()}
      </div>
    </div>
  );
}
