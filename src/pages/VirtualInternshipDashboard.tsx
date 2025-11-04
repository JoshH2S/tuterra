import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAISupervisor } from "@/hooks/useAISupervisor";
import { InternshipSession, InternshipTask, TaskSubmission } from "@/types/internship";
import { SwipeableInternshipView, SwipeableInternshipViewRef } from "@/components/internship/SwipeableInternshipView";
import { TaskDetailsModal } from "@/components/internship/TaskDetailsModal";
import { useInternshipRealtime } from "@/hooks/useInternshipRealtime";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { isTaskOverdue, formatInUserTimezone, getRelativeDeadlineText } from "@/utils/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Briefcase, PlusCircle, Calendar, ExternalLink, MessageSquare, Award, BarChart, History, CheckCircle, FileCheck, Wifi, WifiOff, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { TaskFeedbackDialog } from "@/components/internship/TaskFeedbackDialog";
import { FeedbackHistoryDialog } from "@/components/internship/FeedbackHistoryDialog";
import { TaskOverview } from "@/components/internship/TaskOverview";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { InternshipBanner } from "@/components/internship/InternshipBanner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { InternshipWelcomeScreen } from "@/components/internship/InternshipWelcomeScreen";
import { CompanyProfileService } from "@/services/companyProfileService";
import { PortfolioSubmissionDialog } from "@/components/internship/PortfolioSubmissionDialog";
import { ExitActions } from "@/components/internship/ExitActions";

export default function VirtualInternshipDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  // Redirect to overview page if no sessionId is provided
  useEffect(() => {
    if (!sessionId) {
      navigate("/dashboard/virtual-internship/overview", { replace: true });
      return;
    }
  }, [sessionId, navigate]);
  
  // If no sessionId, don't render anything (will redirect)
  if (!sessionId) {
    return null;
  }
  
  const [hasInternships, setHasInternships] = useState<boolean | null>(null);
  const [loadingState, setLoadingState] = useState<'initial' | 'background' | 'idle'>('initial');
  const [internshipSession, setInternshipSession] = useState<InternshipSession | null>(null);
  const [tasks, setTasks] = useState<InternshipTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  // Cache session data to avoid re-fetching
  const sessionCache = useRef<InternshipSession | null>(null);
  const [selectedTask, setSelectedTask] = useState<InternshipTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // For demo purposes, could be determined by user role
  const [hasFeedbackItems, setHasFeedbackItems] = useState(false);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [canSubmitFinal, setCanSubmitFinal] = useState(false);
  const [allTasks, setAllTasks] = useState<InternshipTask[]>([]);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // ✅ Company profile state
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [companyProfileChecked, setCompanyProfileChecked] = useState(false);
  const [companyName, setCompanyName] = useState<string>("");

  // ✅ Track dashboard visits to prevent duplicates
  const dashboardVisitRecorded = useRef(false);

  // Initialize AI Supervisor
  const aiSupervisor = useAISupervisor({
    sessionId: internshipSession?.id || null,
    enabled: !!internshipSession && !!user
  });

  // Create a ref for the SwipeableInternshipView component
  const internshipViewRef = useRef<SwipeableInternshipViewRef>(null);

  // Define fetchTasks as a useCallback function
  const fetchTasks = useCallback(async (sessionId: string) => {
    if (!user) return;
    
    setTasksLoading(true);
    try {
      // Fetch all tasks for this session
      const { data: taskData, error } = await supabase
        .from("internship_tasks")
        .select("*")
        .eq("session_id", sessionId)
        .order("task_order");

      if (error) throw error;
      
      // Store all tasks for upcoming task preview
      const allTasks = [...taskData];
      
      // Filter out tasks that aren't visible yet
      const now = new Date();
      const visibleTasks = taskData.filter(task => {
        // If visible_after is null or the current time is after visible_after, the task is visible
        return !task.visible_after || new Date(task.visible_after) <= now;
      });

      if (visibleTasks.length === 0) {
        setTasks([]);
        setAllTasks(allTasks); // Store all tasks for upcoming task preview
        setTasksLoading(false);
        return;
      }

      // Fetch submissions for these tasks
      const { data: submissionData, error: submissionError } = await supabase
        .from("internship_task_submissions")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id);

      if (submissionError) throw submissionError;

      // Process tasks with any available submission data
      const processedTasks = visibleTasks.map(task => {
        // Find matching submission if any
        const submission = submissionData.find(sub => sub.task_id === task.id);
        
        // Create typed submission object if we found a match
        let typedSubmission: TaskSubmission | null = null;
        
        if (submission) {
          typedSubmission = {
            id: submission.id,
            response_text: submission.response_text,
            created_at: submission.created_at,
            overall_assessment: submission.overall_assessment || null,
            feedback_provided_at: submission.feedback_provided_at || null,
            quality_rating: submission.quality_rating || null,
            timeliness_rating: submission.timeliness_rating || null,
            collaboration_rating: submission.collaboration_rating || null
          };
        }
        
        // Determine task status
        const isPastDueDate = isTaskOverdue(task.due_date);
        let updatedStatus = task.status;
        
        // If there's a submission, mark as "submitted" or "feedback pending/received"
        if (typedSubmission) {
          updatedStatus = typedSubmission.overall_assessment ? "feedback_received" : "feedback_pending";
        } 
        // If past due date and no submission, mark as overdue
        else if (isPastDueDate && task.status !== "completed") {
          updatedStatus = "overdue";
        }
        
        // Return the task with updated status and submission data
        return {
          ...task,
          status: updatedStatus,
          submission: typedSubmission
        };
      });
      
      // Also process all tasks with status updates for the preview
      const processedAllTasks = allTasks.map(task => {
        const isPastDueDate = isTaskOverdue(task.due_date);
        let updatedStatus = task.status;
        
        if (isPastDueDate && task.status !== "completed") {
          updatedStatus = "overdue";
        }
        
        return {
          ...task,
          status: updatedStatus
        };
      });
      
      setTasks(processedTasks);
      setAllTasks(processedAllTasks); // Store all tasks for upcoming task preview
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error Loading Tasks",
        description: "We couldn't retrieve your task data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTasksLoading(false);
    }
  }, [user, toast]);

  // Function to fetch company name
  const fetchCompanyName = useCallback(async (sessionId: string) => {
    try {
      // First try to get from company profiles (more detailed)
      const { data: profileData, error: profileError } = await supabase
        .from('internship_company_profiles')
        .select('company_name')
        .eq('session_id', sessionId)
        .eq('profile_status', 'completed')
        .limit(1);

      if (!profileError && profileData && profileData.length > 0) {
        setCompanyName(profileData[0].company_name);
        return;
      }

      // Fallback to company details (basic info)
      const { data: detailsData, error: detailsError } = await supabase
        .from('internship_company_details')
        .select('name')
        .eq('session_id', sessionId)
        .limit(1);

      if (!detailsError && detailsData && detailsData.length > 0) {
        setCompanyName(detailsData[0].name);
        return;
      }

      // Final fallback to industry-based name
      const industry = internshipSession?.industry || "Technology";
      setCompanyName(`${industry} Corporation`);

    } catch (error) {
      console.error('Error fetching company name:', error);
      // Fallback to industry-based name
      const industry = internshipSession?.industry || "Technology";
      setCompanyName(`${industry} Corporation`);
    }
  }, [internshipSession?.industry]);

  // Function to update task status (used by TaskOverview component)
  const handleUpdateTaskStatus = useCallback(async (taskId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    if (!user || !internshipSession) return;
    
    try {
      // Update the task status in the database
      const { error } = await supabase
        .from("internship_tasks")
        .update({ status })
        .eq("id", taskId);
        
      if (error) throw error;
      
      // Trigger AI Supervisor task status tracking
      if (aiSupervisor.isEnabled) {
        aiSupervisor.onTaskStatusChanged(taskId, status);
      }
      
      // Refresh tasks to get updated state
      await fetchTasks(internshipSession.id);
      
      // Show success message
      toast({
        title: status === 'completed' ? "Task completed" : "Task status updated",
        description: status === 'completed' 
          ? "Great job! You've marked this task as complete." 
          : `Task status changed to ${status.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error updating task",
        description: "There was a problem updating the task status. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, internshipSession, toast, fetchTasks, aiSupervisor]);
  
  // Callback functions for real-time updates
  const handleTasksUpdate = useCallback(() => {
    if (internshipSession) {
      console.log("Refreshing tasks due to real-time update");
      fetchTasks(internshipSession.id);
    }
  }, [internshipSession, fetchTasks]);
  
  const handleMessagesUpdate = useCallback(() => {
    console.log("New message received in real-time");
    toast({
      title: "New message received",
      description: "You have a new message from your internship supervisor.",
    });
  }, [toast]);
  
  const handleFeedbackUpdate = useCallback(() => {
    console.log("New feedback received in real-time");
    toast({
      title: "Feedback available",
      description: "New feedback is available for one of your submissions.",
    });
    if (internshipSession) {
      fetchTasks(internshipSession.id);
    }
  }, [toast, internshipSession, fetchTasks]);
  
  // Initialize real-time subscriptions
  const { connected } = useInternshipRealtime({
    sessionId: internshipSession?.id || "",
    onTasksUpdate: handleTasksUpdate,
    onMessagesUpdate: handleMessagesUpdate,
    onFeedbackUpdate: handleFeedbackUpdate,
  });
  
  // Update UI when connection status changes
  useEffect(() => {
    setRealtimeConnected(connected);
  }, [connected]);

  // ✅ Reset dashboard visit tracking when session changes
  useEffect(() => {
    dashboardVisitRecorded.current = false;
  }, [sessionId]);

  // Track dashboard visits for AI Supervisor
  useEffect(() => {
    // ✅ Only track visit once when fully initialized AND supervisor state is loaded
    if (internshipSession?.id && 
        aiSupervisor.isEnabled && 
        aiSupervisor.initialized && 
        aiSupervisor.supervisorState?.isInitialized &&  // ✅ Ensure state is loaded
        !dashboardVisitRecorded.current) {
      console.log('Recording dashboard visit for session:', internshipSession.id);
      aiSupervisor.onDashboardVisit();
      dashboardVisitRecorded.current = true;
    }
  }, [internshipSession?.id, aiSupervisor.isEnabled, aiSupervisor.initialized, aiSupervisor.supervisorState?.isInitialized]); // ✅ Add state dependency

  useEffect(() => {
    // Show a welcome toast if redirected from internship creation
    if (location.state?.newInternship) {
      toast({
        title: "Internship Created Successfully",
        description: "Your virtual internship experience has been set up and is ready to explore.",
      });
    }
  }, [location.state, toast]);

  useEffect(() => {
    async function fetchInternshipData() {
      if (!user) return;
      
      // Set loading state based on whether we have cached data
      if (sessionCache.current) {
        setLoadingState('background'); // Background refresh
      } else {
        setLoadingState('initial'); // First load
      }
      
      try {
        // If a specific sessionId is provided, fetch that session
        if (sessionId) {
          const { data: sessionData, error: sessionError } = await supabase
            .from("internship_sessions")
            .select("*")
            .eq("id", sessionId)
            .eq("user_id", user.id)
            .single();
          
          if (sessionError) {
            console.error("Error fetching internship session:", sessionError);
            throw sessionError;
          }
          
          if (sessionData) {
            // Ensure all required properties are present in the session data
            const completeSessionData: InternshipSession = {
              ...sessionData as InternshipSession, // Cast to InternshipSession to avoid type errors
              duration_weeks: (sessionData as any).duration_weeks || 4, // Default to 4 weeks if missing
              start_date: (sessionData as any).start_date || sessionData.created_at // Use created_at as fallback for start_date
            };
            
            // Cache the session data
            sessionCache.current = completeSessionData;
            setInternshipSession(completeSessionData);
            setHasInternships(true);

            // Fetch tasks for this session
            await fetchTasks(completeSessionData.id);
            
            // ✅ Fetch company name
            await fetchCompanyName(completeSessionData.id);
            
            // ✅ Check if company profile needs generation
            if (!companyProfileChecked) {
              const status = await CompanyProfileService.checkProfileStatus(completeSessionData.id);
              if (!status.isComplete && !status.isGenerating) {
                // Redirect to welcome screen instead of showing it directly
                navigate(`/dashboard/virtual-internship/welcome/${completeSessionData.id}`);
                return; // Stop execution to prevent further processing
              }
              setCompanyProfileChecked(true);
            }
          } else {
            setHasInternships(false);
          }
        } else {
          // Otherwise, check if the user has any internships
          const { data, error, count } = await supabase
            .from("internship_sessions")
            .select("*", { count: 'exact' })
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);
            
          if (error) {
            console.error("Error checking internships:", error);
            throw error;
          }
          
          if (count && count > 0 && data && data.length > 0) {
            // Ensure all required properties are present in the session data
            const completeSessionData: InternshipSession = {
              ...data[0] as InternshipSession, // Cast to InternshipSession to avoid type errors
              duration_weeks: (data[0] as any).duration_weeks || 4, // Default to 4 weeks if missing
              start_date: (data[0] as any).start_date || data[0].created_at // Use created_at as fallback for start_date
            };
            
            // Cache the session data
            sessionCache.current = completeSessionData;
            setInternshipSession(completeSessionData);
            setHasInternships(true);

            // Fetch tasks for this session
            await fetchTasks(completeSessionData.id);
            
            // ✅ Fetch company name
            await fetchCompanyName(completeSessionData.id);
            
            // ✅ Check if company profile needs generation
            if (!companyProfileChecked) {
              const status = await CompanyProfileService.checkProfileStatus(completeSessionData.id);
              if (!status.isComplete && !status.isGenerating) {
                // Redirect to welcome screen instead of showing it directly
                navigate(`/dashboard/virtual-internship/welcome/${completeSessionData.id}`);
                return; // Stop execution to prevent further processing
              }
              setCompanyProfileChecked(true);
            }
          } else {
            setHasInternships(false);
          }
        }
      } catch (error) {
        console.error("Error fetching internship data:", error);
        setHasInternships(false);
        toast({
          title: "Error Loading Internship",
          description: "We couldn't retrieve your internship data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingState('idle');
      }
    }
    
    fetchInternshipData();
  }, [user, sessionId, toast, fetchTasks, fetchCompanyName, navigate]);

  // Helper function to get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not_started':
      case 'not started':
        return "bg-slate-100 text-slate-800 border-slate-200";
      case 'in_progress':
      case 'in progress':
        return "bg-amber-100 text-amber-800 border-amber-200";
      case 'submitted':
      case 'feedback_pending':
      case 'feedback pending':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'feedback_received':
      case 'feedback_available':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'completed':
        return "bg-green-100 text-green-800 border-green-200";
      case 'overdue':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Helper function to format status display
  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'feedback_pending':
        return 'Processing Feedback';
      case 'feedback_received':
      case 'feedback_available':
        return 'Feedback Available';
      case 'completed':
        return 'Completed';
      case 'overdue':
        return 'Overdue';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };

  // Function to handle opening the task details modal
  const handleOpenTaskDetails = (task: InternshipTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Function to handle task submission completion
  const handleTaskSubmissionComplete = (showFeedback?: boolean) => {
    // Refresh tasks to get updated status
    if (internshipSession) {
      fetchTasks(internshipSession.id);
      
      // If showFeedback is true, navigate to the feedback tab in the SwipeableInternshipView
      if (showFeedback && internshipViewRef.current) {
        // The feedback tab index is 5 as seen in the renderTabContent function in SwipeableInternshipView
        internshipViewRef.current.setActiveTabIndex(5);
      }
    }
  };

  // Function to open the feedback modal
  const handleViewFeedback = (task: InternshipTask) => {
    setSelectedTask(task);
    setIsFeedbackModalOpen(true);
  };

  // Add a function to check if there are feedback items
  useEffect(() => {
    if (tasks.length > 0) {
      const hasAnyFeedback = tasks.some(task => 
        task.submission?.overall_assessment !== null && 
        task.submission?.overall_assessment !== undefined
      );
      setHasFeedbackItems(hasAnyFeedback);
    }
  }, [tasks]);

  // Add useEffect to calculate task completion status
  useEffect(() => {
    if (tasks.length > 0) {
      const total = tasks.length;
      const completed = tasks.filter(task => task.status === 'completed').length;
      setTotalTasksCount(total);
      setCompletedTasksCount(completed);
      
      // Can submit final project if at least 75% of tasks are completed
      setCanSubmitFinal(completed >= Math.ceil(total * 0.75));
    }
  }, [tasks]);

  // ✅ Show welcome screen if company profile needs generation - REPLACE THIS BLOCK
  if (showWelcomeScreen && internshipSession) {
    // Redirect to welcome screen instead of showing it directly
    navigate(`/dashboard/virtual-internship/welcome/${internshipSession.id}`);
    return null; // Return null while navigating
  }


  // Only show full-page loading on initial load without cached data
  if (loadingState === 'initial' && !sessionCache.current) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="large" />
          <p className="text-muted-foreground">Loading your internship experience...</p>
        </div>
      </div>
    );
  }
  
  if (hasInternships === false) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg">
          <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Virtual Internship Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get hands-on experience by creating a virtual internship tailored to your career goals
          </p>
          <div className="flex flex-col gap-3">
            {subscription.tier === "free" ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <Lock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-semibold text-amber-800 mb-1">Premium Feature</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Virtual internships require a Pro or Premium subscription
                </p>
                <Button 
                  onClick={() => navigate("/pricing")}
                  size="sm"
                  className="gap-2 bg-amber-600 hover:bg-amber-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Upgrade Now
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate("/dashboard/virtual-internship/new")} 
                className="gap-2 touch-manipulation"
              >
                <PlusCircle className="h-5 w-5" />
                Create Virtual Internship
              </Button>
            )}
            
            {/* Preview button available to ALL users */}
            <Button 
              onClick={() => navigate("/internship-preview")}
              variant="outline"
              className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <Sparkles className="h-4 w-4" />
              Try Virtual Internship Preview
            </Button>
          </div>
        </div>
      </div>
    );
  }


  // If the internship is completed, show a completion card
  if (internshipSession?.is_completed) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-green-800 dark:text-green-300">
                  Internship Completed
                </CardTitle>
                <CardDescription className="text-green-700 dark:text-green-400">
                  Congratulations on completing your virtual internship!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700 dark:text-green-400">
              You've successfully completed your internship as a {internshipSession.job_title} in the {internshipSession.industry} industry.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button 
                onClick={() => navigate(`/dashboard/virtual-internship/completion?sessionId=${internshipSession.id}`)}
                className="gap-2"
              >
                <Award className="h-4 w-4" />
                View Completion Certificate
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard/virtual-internship/new")}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Start New Internship
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-6 max-w-7xl min-h-screen ${
      isMobile ? 'pb-[calc(env(safe-area-inset-bottom)+24px)]' : ''
    }`}>
      {/* Banner that spans the full width */}
      {loadingState === 'background' && !internshipSession ? (
        <Skeleton className="w-full h-48 mb-8 rounded-lg" />
      ) : internshipSession ? (
        <InternshipBanner 
          sessionId={internshipSession.id}
          industry={internshipSession.industry}
        />
      ) : null}
      
      {/* User profile header with company information - positioned on top of the banner */}
      <div className={`relative z-10 mb-8 flex flex-col items-center sm:items-start sm:flex-row gap-4 ${
        isMobile ? '-mt-12' : '-mt-24'
      }`}>
        <div className="relative">
          <Avatar className={`border-4 border-white shadow-md ${
            isMobile ? 'h-16 w-16' : 'h-24 w-24'
          }`}>
            {user?.user_metadata?.avatar_url ? (
              <AvatarImage 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="object-cover" 
              />
            ) : (
              <AvatarFallback className={`bg-primary/10 text-primary ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                {`${user?.user_metadata?.first_name?.[0] || ""}${user?.user_metadata?.last_name?.[0] || ""}`.toUpperCase() || "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className={`absolute bg-white rounded-full shadow-md ${
            isMobile ? '-bottom-2 -right-2 p-1' : '-bottom-3 -right-3 p-2'
          }`}>
            <Badge className={`bg-primary hover:bg-primary font-normal ${
              isMobile ? 'text-[10px] px-1.5 py-0' : 'text-xs'
            }`}>
              Active
            </Badge>
          </div>
        </div>
        <div className={`text-center sm:text-left bg-white/90 rounded-lg shadow-sm backdrop-blur-sm ${
          isMobile ? 'p-2.5' : 'p-3'
        }`}>
          <h2 className={`font-bold leading-tight ${
            isMobile ? 'text-lg' : 'text-xl sm:text-2xl'
          }`}>
            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </h2>
          <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Intern at <span className="font-medium text-primary">
              {companyName || `${internshipSession?.industry || "Technology"} Corporation`}
            </span>
          </div>
          <div className={`flex flex-wrap justify-center sm:justify-start items-center gap-2 ${
            isMobile ? 'mt-1.5' : 'mt-2'
          }`}>
            <Badge variant="outline" className={`bg-background ${
              isMobile ? 'text-[10px] px-1.5 py-0' : ''
            }`}>
              {internshipSession?.job_title || "Virtual Intern"}
            </Badge>
            <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
            <span className={`text-muted-foreground ${
              isMobile ? 'text-[10px]' : 'text-xs'
            }`}>
              Started {internshipSession?.start_date ? format(new Date(internshipSession.start_date), 'MMM d, yyyy') : 'Recently'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Clean, focused header */}
      <header className="mb-6 pb-4 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {internshipSession?.job_title || "Virtual Internship"}
            </h1>
            <p className="text-muted-foreground">{internshipSession?.industry}</p>
          </div>
          
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-muted/40">
                    {realtimeConnected ? (
                      <Wifi className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    <span className="text-muted-foreground">
                      {realtimeConnected ? "Live" : "Offline"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {realtimeConnected 
                    ? "Real-time updates are active" 
                    : "Currently in offline mode. Updates require page refresh."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
      {hasFeedbackItems && internshipSession && (
          <Button 
            variant="outline" 
            size="sm" 
                className="gap-1.5 h-8"
            onClick={() => setIsHistoryModalOpen(true)}
          >
                <History className="h-3.5 w-3.5" />
                Feedback History
          </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Navigation tabs */}
      <div className="mb-6">
        <SwipeableInternshipView 
          ref={internshipViewRef}
          sessionData={{
            id: internshipSession!.id,
            title: internshipSession!.job_title,
            description: internshipSession!.job_description || "Virtual internship experience",
            start_date: internshipSession!.start_date || internshipSession!.created_at,
            created_at: internshipSession!.created_at,
            job_title: internshipSession!.job_title,
            industry: internshipSession!.industry
          }} 
          onOpenTaskDetails={(taskId: string) => {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
              handleOpenTaskDetails(task);
            }
          }} 
        />
      </div>
      
      {/* Conditional final project card */}
      {canSubmitFinal && internshipSession && (
        <section className="mb-6">
          <Card className="border-primary/20 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Ready to Complete Your Internship</h3>
                    <p className="text-xs text-muted-foreground">
                      You've completed {completedTasksCount} of {totalTasksCount} tasks
                    </p>
                  </div>
          </div>
                <PortfolioSubmissionDialog
                  sessionId={internshipSession.id}
                  userId={user.id}
                  onSubmissionComplete={() => {
                    // Refresh the page to show completion status
                    window.location.reload();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      )}
      
      {/* Exit Actions Section */}
      {internshipSession && (
        <ExitActions sessionId={internshipSession.id} />
      )}

      {/* Task Details Modal */}
      {user && (
        <TaskDetailsModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          userId={user.id}
          sessionData={internshipSession!}
          tasks={tasks}
          onSubmissionComplete={handleTaskSubmissionComplete}
        />
      )}

      {/* Task Feedback Modal */}
      {selectedTask && (
        <TaskFeedbackDialog
          isOpen={isFeedbackModalOpen}
          onClose={() => {
            setIsFeedbackModalOpen(false);
            // Refresh data after closing feedback dialog (in case feedback was added)
            if (internshipSession) {
              fetchTasks(internshipSession.id);
            }
          }}
          task={selectedTask}
          submission={selectedTask.submission}
          isAdmin={isAdmin}
        />
      )}
      
      {/* Feedback History Modal */}
      {internshipSession && (
        <FeedbackHistoryDialog
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          sessionId={internshipSession.id}
        />
      )}
    </div>
  );
}
