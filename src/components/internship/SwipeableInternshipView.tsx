
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileInternshipHeader } from "./MobileInternshipHeader";
import { WelcomePanel } from "./WelcomePanel";
import { TaskOverview } from "./TaskOverview";
import { MessagingPanel } from "./MessagingPanel";
import { FeedbackCenter } from "./FeedbackCenter";
import { CalendarView } from "./CalendarView";
import { ResourceHub } from "./ResourceHub";
import { GamificationPanel } from "./GamificationPanel";
import { ExitActions } from "./ExitActions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InternshipSession } from "@/pages/VirtualInternshipDashboard";
import { LoadingSpinner } from "@/components/ui/loading-states";

export interface InternshipTask {
  id: string;
  session_id: string;
  title: string;
  description: string;
  instructions?: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  task_order: number;
  created_at: string;
}

export interface InternshipMessage {
  id: string;
  session_id: string;
  sender: string;
  subject: string;
  content: string;
  sent_at: string;
}

export interface InternshipEvent {
  id: string;
  session_id: string;
  title: string;
  type: 'meeting' | 'deadline' | 'milestone';
  date: string;
}

export interface InternshipResource {
  id: string;
  session_id: string;
  title: string;
  type: string;
  link: string;
}

interface InternshipContent {
  tasks: InternshipTask[];
  messages: InternshipMessage[];
  events: InternshipEvent[];
  resources: InternshipResource[];
}

interface SwipeableInternshipViewProps {
  sessionData: InternshipSession;
}

/**
 * A component that provides swipeable navigation between different
 * sections of the virtual internship dashboard on mobile devices.
 */
export function SwipeableInternshipView({ sessionData }: SwipeableInternshipViewProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [selectedView, setSelectedView] = useState<string>("overview");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [internshipContent, setInternshipContent] = useState<InternshipContent>({
    tasks: [],
    messages: [],
    events: [],
    resources: []
  });
  
  useEffect(() => {
    async function fetchInternshipContent() {
      setLoading(true);
      try {
        // Fetch all related content in parallel
        const [tasksResult, messagesResult, eventsResult, resourcesResult] = await Promise.all([
          supabase
            .from("internship_tasks")
            .select("*")
            .eq("session_id", sessionData.id)
            .order("task_order", { ascending: true }),
          
          supabase
            .from("internship_messages")
            .select("*")
            .eq("session_id", sessionData.id)
            .order("sent_at", { ascending: false }),
          
          supabase
            .from("internship_events")
            .select("*")
            .eq("session_id", sessionData.id)
            .order("date", { ascending: true }),
          
          supabase
            .from("internship_resources")
            .select("*")
            .eq("session_id", sessionData.id)
        ]);

        if (tasksResult.error) throw tasksResult.error;
        if (messagesResult.error) throw messagesResult.error;
        if (eventsResult.error) throw eventsResult.error;
        if (resourcesResult.error) throw resourcesResult.error;

        // Update task status based on due dates
        const tasks = tasksResult.data.map(task => {
          const dueDate = new Date(task.due_date);
          const isOverdue = task.status !== 'completed' && dueDate < new Date() && task.status !== 'overdue';
          
          return {
            ...task,
            status: isOverdue ? 'overdue' : task.status
          };
        });

        setInternshipContent({
          tasks,
          messages: messagesResult.data,
          events: eventsResult.data,
          resources: resourcesResult.data
        });

      } catch (error) {
        console.error("Error fetching internship content:", error);
        toast({
          title: "Error Loading Content",
          description: "We couldn't retrieve the full internship content. Some features may be limited.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (sessionData?.id) {
      fetchInternshipContent();
    }
  }, [sessionData, toast]);
  
  // Views in the order they should appear
  const views = [
    "overview", "tasks", "messages", "feedback", 
    "calendar", "resources", "achievements", "exit"
  ];

  // Minimum swipe distance to trigger navigation (in pixels)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = views.indexOf(selectedView);
    
    if (isLeftSwipe && currentIndex < views.length - 1) {
      // Navigate to next view
      setSelectedView(views[currentIndex + 1]);
    }
    
    if (isRightSwipe && currentIndex > 0) {
      // Navigate to previous view
      setSelectedView(views[currentIndex - 1]);
    }
    
    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Function to update task status
  const updateTaskStatus = async (taskId: string, newStatus: 'not_started' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from("internship_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);
      
      if (error) throw error;
      
      // Update local state
      setInternshipContent(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      }));
      
      toast({
        title: "Task Updated",
        description: `Task has been marked as ${newStatus.replace('_', ' ')}.`,
      });
      
      // Provide haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the task status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to render the appropriate mobile view based on selection
  const renderMobileView = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <LoadingSpinner size="default" />
          <p className="mt-4 text-sm text-muted-foreground">Loading internship content...</p>
        </div>
      );
    }
    
    switch (selectedView) {
      case "tasks":
        return <TaskOverview 
                 tasks={internshipContent.tasks} 
                 updateTaskStatus={updateTaskStatus}
               />;
      case "messages":
        return <MessagingPanel messages={internshipContent.messages} />;
      case "feedback":
        return <FeedbackCenter sessionData={sessionData} />;
      case "calendar":
        return <CalendarView events={internshipContent.events} tasks={internshipContent.tasks} />;
      case "resources":
        return <ResourceHub resources={internshipContent.resources} />;
      case "achievements":
        return <GamificationPanel sessionData={sessionData} tasks={internshipContent.tasks} />;
      case "exit":
        return <ExitActions sessionId={sessionData.id} />;
      default:
        return <WelcomePanel 
                 sessionData={sessionData}
                 tasks={internshipContent.tasks} 
                 startDate={sessionData?.start_date || ""}
               />;
    }
  };
  
  if (loading && !isMobile) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="space-y-6">
            {Array(i === 0 ? 3 : i === 1 ? 2 : 3).fill(0).map((_, j) => (
              <div key={j} className="rounded-lg border bg-card p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  
  if (!isMobile) {
    // Render traditional layout for desktop
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <WelcomePanel 
            sessionData={sessionData}
            tasks={internshipContent.tasks}
            startDate={sessionData?.start_date || ""}
          />
          <MessagingPanel messages={internshipContent.messages} />
          <GamificationPanel sessionData={sessionData} tasks={internshipContent.tasks} />
        </div>
        
        <div className="space-y-6">
          <TaskOverview 
            tasks={internshipContent.tasks} 
            updateTaskStatus={updateTaskStatus}
          />
          <FeedbackCenter sessionData={sessionData} />
        </div>
        
        <div className="space-y-6">
          <CalendarView events={internshipContent.events} tasks={internshipContent.tasks} />
          <ResourceHub resources={internshipContent.resources} />
          <ExitActions sessionId={sessionData.id} />
        </div>
      </div>
    );
  }
  
  // Mobile view with touch events
  return (
    <div className="space-y-4">
      <MobileInternshipHeader 
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        jobTitle={sessionData?.job_title || ""}
      />
      <div 
        className="mb-16 touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderMobileView()}
      </div>
    </div>
  );
}
