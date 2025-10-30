import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, BarChart2, Briefcase, FileCheck, Calendar, MessageSquare, Award, CheckCircle, Building, Target, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { WelcomePanel } from "./WelcomePanel";
import { DashboardOverviewPanel } from "./DashboardOverviewPanel";
import { TaskOverview } from "./TaskOverview";
import { CalendarView } from "./CalendarView";
import { EmailMessagingPanel } from "./EmailMessagingPanel";
import { FeedbackCenter } from "./FeedbackCenter";
import { SkillsDashboard } from "./skills/SkillsDashboard";
import { FinalProjectForm } from "./FinalProjectForm";
import { CareerPortfolioProject } from "./CareerPortfolioProject";
import { InternshipMobileHeader } from "./InternshipMobileHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternshipMetricsDashboard } from "./InternshipMetricsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyInfoCard } from "./CompanyInfoCard";
import { InternshipTask, InternshipEvent, InternshipResource, TaskSubmission } from "@/types/internship";
import { AchievementsDisplay } from "./AchievementsDisplay";

interface SwipeableInternshipViewProps {
  sessionData: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    created_at: string;
    job_title: string;
    industry: string;
  };
  onOpenTaskDetails: (taskId: string) => void;
}

// Define the ref interface
export interface SwipeableInternshipViewRef {
  setActiveTabIndex: (index: number) => void;
}

export const SwipeableInternshipView = forwardRef<SwipeableInternshipViewRef, SwipeableInternshipViewProps>(
  ({ sessionData, onOpenTaskDetails }, ref) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<InternshipTask[]>([]);
  const [visibleTasks, setVisibleTasks] = useState<InternshipTask[]>([]);
  const [events, setEvents] = useState<InternshipEvent[]>([]);
  const [resources, setResources] = useState<InternshipResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [canSubmitFinal, setCanSubmitFinal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const tabs = [
    "Overview", 
    "Tasks", 
    "Calendar", 
    "Messages", 
    "Company", 
    "Feedback", 
    "Skills",
    "Final Project"
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
          let status = task.status;
          
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
        
        // Check completion eligibility (75% of tasks completed)
        const completedTasks = allTasks.filter(task => task.status === 'completed').length;
        const completionRate = allTasks.length > 0 ? completedTasks / allTasks.length : 0;
        setCanSubmitFinal(completionRate >= 0.75);

        // Check if internship is already completed
        const { data: sessionStatus } = await supabase
          .from("internship_sessions")
          .select("is_completed")
          .eq("id", sessionData.id)
          .single();
        
        setIsCompleted(sessionStatus?.is_completed || false);
        
        // Fetch events
        const { data: eventData, error: eventError } = await supabase
          .from("internship_events")
          .select("*")
          .eq("session_id", sessionData.id);
        
        if (eventError) throw eventError;
        
        // Map database fields to interface fields
        const mappedEvents = (eventData || []).map(event => {
          const eventAny = event as any;
          return {
            id: eventAny.id,
            session_id: eventAny.session_id,
            title: eventAny.title,
            description: eventAny.description || '', // Handle missing description
            event_date: eventAny.date,
            event_type: eventAny.type,
            created_at: eventAny.created_at || new Date().toISOString() // Handle missing created_at
          } as InternshipEvent;
        });
        
        setEvents(mappedEvents);
        
        // Fetch resources
        const { data: resourceData, error: resourceError } = await supabase
          .from("internship_resources")
          .select("*")
          .eq("session_id", sessionData.id);
        
        if (resourceError) throw resourceError;
        
        // Map database fields to interface fields
        const mappedResources = (resourceData || []).map(resource => ({
          id: resource.id,
          session_id: resource.session_id,
          title: resource.title,
          description: '', // Default empty description
          url: resource.link,
          resource_type: resource.type,
          created_at: new Date().toISOString() // Default created_at
        })) as InternshipResource[];
        
        setResources(mappedResources);
        
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
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => 
          task.id === taskId ? { ...task, status } : task
        );
        
        // Recalculate completion eligibility
        const completedTasks = updatedTasks.filter(task => task.status === 'completed').length;
        const completionRate = updatedTasks.length > 0 ? completedTasks / updatedTasks.length : 0;
        setCanSubmitFinal(completionRate >= 0.75);
        
        return updatedTasks;
      });
      
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
    
    // Create a full session data object for components that need it
    const fullSessionData = {
      id: sessionData.id,
      user_id: '', // This would need to be passed from parent if needed
      job_title: sessionData.job_title,
      industry: sessionData.industry,
      job_description: sessionData.description,
      current_phase: 1, // Default value
      created_at: sessionData.created_at,
      start_date: sessionData.start_date,
    };

    switch (activeIndex) {
      case 0:
        return <DashboardOverviewPanel sessionData={fullSessionData} tasks={visibleTasks} allTasks={tasks} startDate={startDate} onOpenTaskDetails={(task: InternshipTask) => onOpenTaskDetails(task.id)} />;
      case 1:
        return (
          <div className="p-6">
            <TaskOverview 
              tasks={visibleTasks} 
              onUpdateTaskStatus={updateTaskStatus} 
              onOpenTaskDetails={(task: InternshipTask) => onOpenTaskDetails(task.id)} 
              compact={false} 
              allTasks={tasks}
              maxDisplayCount={5}
            />
          </div>
        );
      case 2:
        return <CalendarView events={events} tasks={tasks} startDate={startDate} onOpenTaskDetails={(task: InternshipTask) => onOpenTaskDetails(task.id)} />;
      case 3:
        return <EmailMessagingPanel sessionId={sessionData.id} />;
      case 4:
        return <CompanyInfoCard sessionId={sessionData.id} />;
      case 5:
        return <FeedbackCenter sessionData={fullSessionData} tasks={visibleTasks} />;
      case 6:
        return <SkillsDashboard sessionId={sessionData.id} userId={user?.id || ''} />;
      case 7:
        return (
          <div className="space-y-6">
            {!canSubmitFinal && !isCompleted && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-amber-600" />
                    <div>
                      <h3 className="font-medium text-amber-800">Complete More Tasks</h3>
                      <p className="text-sm text-amber-700">
                        You need to complete at least 75% of your assigned tasks before submitting your final project.
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        Progress: {tasks.filter(t => t.status === 'completed').length}/{tasks.length} tasks completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {isCompleted && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-green-800">Internship Completed!</h3>
                      <p className="text-sm text-green-700">
                        Congratulations! You've successfully completed your virtual internship.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {canSubmitFinal && !isCompleted && (
              <CareerPortfolioProject 
                sessionId={sessionData.id} 
                userId={user?.id || ''} 
                jobTitle={sessionData.job_title}
                industry={sessionData.industry}
                completedTasks={tasks.filter(t => t.status === 'completed')}
              />
            )}
            
            {isCompleted && (
              <Card>
                <CardContent className="p-6 text-center">
                  <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Final Project Submitted</h3>
                  <p className="text-muted-foreground mb-4">
                    Your final project has been successfully submitted. You can now generate your certificate and download your performance report.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" size="sm">
                      View Completion Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  // Expose method to set active tab index via ref
  useImperativeHandle(ref, () => ({
    setActiveTabIndex: (index: number) => {
      if (index >= 0 && index < tabs.length) {
        setActiveIndex(index);
      }
    }
  }));
  
  // Set active tab through imperative handle
  const handleTabClick = (index: number) => {
    setActiveIndex(index);
  };
  
  return (
    <div className="bg-white border rounded-md shadow-sm overflow-hidden">
      {/* Mobile header bar */}
      {isMobile && (
        <InternshipMobileHeader 
          title={sessionData.job_title} 
          industry={sessionData.industry}
          activeIndex={activeIndex}
          onPrevious={handlePrevious}
          onNext={handleNext}
          maxIndex={tabs.length - 1}
        />
      )}
      
      {/* Desktop tabs */}
      {!isMobile && (
        <div className="border-b px-1">
          <div className="flex items-center justify-between">
            <Tabs defaultValue={tabs[activeIndex].toLowerCase()} onValueChange={(value) => {
              const index = tabs.findIndex(tab => tab.toLowerCase() === value);
              if (index !== -1) {
                setActiveIndex(index);
              }
            }}>
              <TabsList className="h-10 py-1">
                {tabs.map((tab, index) => (
                  <TabsTrigger 
                    key={tab} 
                    value={tab.toLowerCase()}
                    className="text-sm px-3 py-1.5 data-[state=active]:bg-primary/10"
                  >
                    <div className="flex items-center gap-1.5">
                      {getTabIcon(index)}
                      {tab}
                      {/* Show indicator for Final Project tab */}
                      {tab === "Final Project" && (
                        <>
                          {isCompleted && (
                            <Badge variant="default" className="text-xs px-1.5 py-0 bg-green-500 text-white">
                              ✓
                            </Badge>
                          )}
                          {!isCompleted && canSubmitFinal && (
                            <Badge variant="default" className="text-xs px-1.5 py-0 bg-green-500 text-white">
                              Ready
                            </Badge>
                          )}
                          {!isCompleted && !canSubmitFinal && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              Locked
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2 pr-2">
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={activeIndex === 0}
                onClick={handlePrevious}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={activeIndex === tabs.length - 1}
                onClick={handleNext}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab content */}
      <div className="p-5">
        {renderTabContent()}
      </div>
    </div>
  );
});

SwipeableInternshipView.displayName = "SwipeableInternshipView";

// Helper function to get icon for tab
function getTabIcon(index: number) {
  const icons = [
    <Briefcase key="overview" className="h-4 w-4" />,
    <FileCheck key="tasks" className="h-4 w-4" />,
    <Calendar key="calendar" className="h-4 w-4" />,
    <MessageSquare key="messages" className="h-4 w-4" />,
    <Building key="company" className="h-4 w-4" />,
    <CheckCircle key="feedback" className="h-4 w-4" />,
    <Target key="skills" className="h-4 w-4" />,
    <GraduationCap key="final-project" className="h-4 w-4" />
  ];
  
  return icons[index] || <Briefcase className="h-4 w-4" />;
}
